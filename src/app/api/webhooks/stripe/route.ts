// app/api/webhooks/stripe/route.ts - UPDATED WITH REFUND HANDLING
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// GET handler for testing
export async function GET() {
  console.log('GET request to webhook endpoint');
  return NextResponse.json({ 
    status: "Webhook endpoint is working",
    timestamp: new Date().toISOString(),
    env_vars: {
      stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
      webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
}

export async function POST(request: NextRequest) {
  console.log('=== WEBHOOK STARTED ===');
  
  try {
    // Check if this is a test mode request
    const isTestMode = request.headers.get('x-test-mode') === 'true';
    console.log('Test mode:', isTestMode);

    // Log environment variables (safely)
    console.log('Environment check:', {
      stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
      webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    console.log('Supabase client created');

    let event: Stripe.Event;

    if (isTestMode) {
      // In test mode, parse the body as JSON directly
      console.log('Test mode: parsing body as JSON');
      const bodyJson = await request.json();
      event = bodyJson;
      console.log('Test event parsed:', event.type, event.id);
    } else {
      // Normal webhook processing with signature verification
      const body = await request.text();
      console.log('Request body length:', body.length);
      
      const sig = request.headers.get('stripe-signature');
      console.log('Stripe signature present:', !!sig);
      
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      console.log('Endpoint secret present:', !!endpointSecret);

      try {
        event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
        console.log('Event constructed successfully:', event.type, event.id);
      } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
    }

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed');
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.created':
        console.log('Processing customer.subscription.created');
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.updated':
        console.log('Processing customer.subscription.updated');
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        console.log('Processing customer.subscription.deleted');
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'charge.refunded':
        console.log('Processing charge.refunded');
        await handleChargeRefunded(event.data.object as Stripe.Charge, supabase);
        break;

      case 'invoice.payment_failed':
        console.log('Processing invoice.payment_failed');
        await handlePaymentFailed(event.data.object as any, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true, event_type: event.type, event_id: event.id });

  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Webhook handler error', 
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('=== HANDLING CHECKOUT COMPLETED ===');
  console.log('Session ID:', session.id);
  console.log('Session mode:', session.mode);
  console.log('Subscription ID:', session.subscription);
  console.log('Metadata:', session.metadata);

  if (session.mode === 'subscription' && session.subscription) {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    console.log('User ID from metadata:', userId);
    console.log('Tier from metadata:', tier);

    if (!userId || !tier) {
      console.error('❌ Missing userId or tier in session metadata');
      return;
    }

    try {
      let subscription: any;
      
      // Check if this is a test subscription ID
      if (session.subscription.toString().startsWith('sub_test_')) {
        console.log('Test mode: using mock subscription data');
        subscription = {
          id: session.subscription,
          status: 'active',
          customer: session.customer || 'cus_test_sample',
          metadata: { userId, tier },
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
        };
      } else {
        // Get the subscription details from Stripe for real subscriptions
        console.log('Fetching subscription from Stripe...');
        subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        console.log('Subscription retrieved:', subscription.id, subscription.status);
      }
      
      // Create/update subscription in database
      await upsertSubscription(userId, tier, subscription, supabase);
    } catch (error: any) {
      console.error('❌ Error in handleCheckoutCompleted:', error);
      throw error;
    }
  } else {
    console.log('Not a subscription checkout or no subscription ID');
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log('=== HANDLING SUBSCRIPTION CREATED ===');
  console.log('Subscription ID:', subscription.id);
  console.log('Metadata:', subscription.metadata);

  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier;

  if (!userId || !tier) {
    console.error('❌ Missing userId or tier in subscription metadata');
    return;
  }

  await upsertSubscription(userId, tier, subscription, supabase);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log('=== HANDLING SUBSCRIPTION UPDATED ===');
  console.log('Subscription ID:', subscription.id);
  console.log('Status:', subscription.status);
  console.log('Cancel at period end:', subscription.cancel_at_period_end);

  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier;

  if (!userId || !tier) {
    console.error('❌ Missing userId or tier in subscription metadata');
    return;
  }

  // If subscription is canceled but cancel_at_period_end is true,
  // keep it active until the period ends
  let effectiveStatus = subscription.status;
  if (subscription.cancel_at_period_end && subscription.status === 'active') {
    effectiveStatus = 'active'; // Keep active until period end
    console.log('Subscription canceled but keeping active until period end');
  }

  await upsertSubscription(userId, tier, subscription, supabase, effectiveStatus);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('=== HANDLING SUBSCRIPTION DELETED ===');
  console.log('Subscription ID:', subscription.id);
  console.log('This means the subscription has truly ended - period expired');

  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('❌ Missing userId in subscription metadata');
    return;
  }

  try {
    // Now actually cancel subscription access (period has ended)
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error canceling subscription:', error);
    } else {
      console.log(`✅ Successfully canceled subscription for user ${userId} - billing period ended`);
    }
  } catch (error: any) {
    console.error('❌ Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

async function handleChargeRefunded(charge: Stripe.Charge, supabase: any) {
  console.log('=== HANDLING CHARGE REFUNDED ===');
  console.log('Charge ID:', charge.id);
  console.log('Customer ID:', charge.customer);
  console.log('Amount refunded:', charge.amount_refunded);

  if (!charge.customer) {
    console.log('No customer associated with charge');
    return;
  }

  try {
    // Find user by customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', charge.customer)
      .single();

    if (profileError || !profile) {
      console.error('❌ Could not find user for customer:', charge.customer);
      return;
    }

    const userId = profile.id;
    console.log('Found user for refund:', userId);

    // Check if this was a full refund
    if (charge.amount_refunded === charge.amount) {
      console.log('Full refund detected - canceling subscription access');
      
      // Cancel subscription access
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error canceling subscription for refund:', error);
      } else {
        console.log(`✅ Successfully canceled subscription access for user ${userId} due to refund`);
      }
    } else {
      console.log('Partial refund - not canceling subscription');
    }

  } catch (error: any) {
    console.error('❌ Error in handleChargeRefunded:', error);
    throw error;
  }
}

async function handlePaymentFailed(invoice: any, supabase: any) {
  console.log('=== HANDLING PAYMENT FAILED ===');
  console.log('Invoice ID:', invoice.id);
  console.log('Customer ID:', invoice.customer);
  console.log('Subscription ID:', invoice.subscription);

  if (!invoice.customer) {
    console.log('No customer associated with failed payment');
    return;
  }

  try {
    // Find user by customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', invoice.customer)
      .single();

    if (profileError || !profile) {
      console.error('❌ Could not find user for customer:', invoice.customer);
      return;
    }

    const userId = profile.id;
    console.log('Found user for failed payment:', userId);

    // Update subscription status to past_due
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating subscription for failed payment:', error);
    } else {
      console.log(`✅ Updated subscription to past_due for user ${userId}`);
    }

  } catch (error: any) {
    console.error('❌ Error in handlePaymentFailed:', error);
    throw error;
  }
}

async function upsertSubscription(userId: string, tier: string, subscription: any, supabase: any, overrideStatus?: string) {
  console.log('=== UPSERTING SUBSCRIPTION ===');
  console.log('User ID:', userId);
  console.log('Tier:', tier);
  console.log('Subscription status:', subscription.status);
  console.log('Override status:', overrideStatus);
  console.log('Cancel at period end:', subscription.cancel_at_period_end);

  try {
    // Check if subscription already exists first
    console.log('Checking for existing subscription...');
    const { data: existingSubscription, error: selectError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error checking existing subscription:', selectError);
      throw selectError;
    }

    // Use override status if provided, otherwise use subscription status
    const finalStatus = overrideStatus || subscription.status;

    // Calculate billing period dates
    const currentPeriodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    
    const currentPeriodEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(); // 30 days from now

    if (existingSubscription) {
      console.log('Updating existing subscription...');
      // Update existing subscription
      const updateData = {
        user_id: userId,
        tier: tier,
        status: finalStatus,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString()
      };

      console.log('Update data:', updateData);

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating subscription:', error);
        throw error;
      } else {
        console.log(`✅ Updated subscription for user ${userId} to ${tier} (status: ${finalStatus})`);
      }
    } else {
      console.log('Creating new subscription...');
      // Create new subscription
      const insertData = {
        user_id: userId,
        tier: tier,
        status: finalStatus,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Insert data:', insertData);
      
      const { error } = await supabase
        .from('subscriptions')
        .insert(insertData);

      if (error) {
        console.error('❌ Error creating subscription:', error);
        throw error;
      } else {
        console.log(`✅ Created new subscription for user ${userId} with tier ${tier} (status: ${finalStatus})`);
      }
    }

    // Store/update Stripe customer ID in profiles table (only for real customers)
    if (!subscription.customer.toString().startsWith('cus_test_')) {
      console.log('Updating profile with customer ID...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          stripe_customer_id: subscription.customer as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
      } else {
        console.log('✅ Updated profile with customer ID');
      }
    }

    // Reset usage tracking for the new billing period (only if subscription is active)
    if (finalStatus === 'active') {
      console.log('Resetting usage tracking...');
      const { error: usageError } = await supabase
        .from('usage_tracking')
        .delete()
        .eq('user_id', userId);

      if (usageError) {
        console.error('⚠️ Error resetting usage tracking:', usageError);
      } else {
        console.log('✅ Reset usage tracking');
      }
    }

    console.log(`✅ Successfully processed subscription for user ${userId} with tier ${tier}`);
  } catch (error: any) {
    console.error('❌ Error in upsertSubscription:', error);
    throw error;
  }
}
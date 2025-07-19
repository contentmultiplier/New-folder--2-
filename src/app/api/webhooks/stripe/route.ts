// app/api/webhooks/stripe/route.ts - DEBUG VERSION
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
          metadata: { userId, tier }
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

  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier;

  if (!userId || !tier) {
    console.error('❌ Missing userId or tier in subscription metadata');
    return;
  }

  await upsertSubscription(userId, tier, subscription, supabase);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('=== HANDLING SUBSCRIPTION DELETED ===');
  console.log('Subscription ID:', subscription.id);

  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('❌ Missing userId in subscription metadata');
    return;
  }

  try {
    // Cancel subscription in database
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
      console.log(`✅ Successfully canceled subscription for user ${userId}`);
    }
  } catch (error: any) {
    console.error('❌ Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

async function upsertSubscription(userId: string, tier: string, subscription: any, supabase: any) {
  console.log('=== UPSERTING SUBSCRIPTION ===');
  console.log('User ID:', userId);
  console.log('Tier:', tier);
  console.log('Subscription status:', subscription.status);

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

    if (existingSubscription) {
      console.log('Updating existing subscription...');
      // Update existing subscription (no created_at needed)
      const updateData = {
        user_id: userId,
        tier: tier,
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
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
        console.log(`✅ Updated subscription for user ${userId} to ${tier}`);
      }
    } else {
      console.log('Creating new subscription...');
      // Create new subscription (with created_at)
      const insertData = {
        user_id: userId,
        tier: tier,
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
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
        console.log(`✅ Created new subscription for user ${userId} with tier ${tier}`);
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

    // Reset usage tracking for the new billing period
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

    console.log(`✅ Successfully processed subscription for user ${userId} with tier ${tier}`);
  } catch (error: any) {
    console.error('❌ Error in upsertSubscription:', error);
    throw error;
  }
}
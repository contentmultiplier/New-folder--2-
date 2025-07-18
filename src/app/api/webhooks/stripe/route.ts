// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing checkout.session.completed:', session.id);

  if (session.mode === 'subscription' && session.subscription) {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (!userId || !tier) {
      console.error('Missing userId or tier in session metadata');
      return;
    }

    // Get the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Create/update subscription in database
    await upsertSubscription(userId, tier, subscription, supabase);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing customer.subscription.created:', subscription.id);

  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier;

  if (!userId || !tier) {
    console.error('Missing userId or tier in subscription metadata');
    return;
  }

  await upsertSubscription(userId, tier, subscription, supabase);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing customer.subscription.updated:', subscription.id);

  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier;

  if (!userId || !tier) {
    console.error('Missing userId or tier in subscription metadata');
    return;
  }

  await upsertSubscription(userId, tier, subscription, supabase);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing customer.subscription.deleted:', subscription.id);

  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Cancel subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error canceling subscription:', error);
  } else {
    console.log(`Successfully canceled subscription for user ${userId}`);
  }
}

async function upsertSubscription(userId: string, tier: string, subscription: Stripe.Subscription, supabase: any) {
  const subscriptionData = {
    user_id: userId,
    tier: tier,
    status: subscription.status,
    updated_at: new Date().toISOString()
  };

  // Check if subscription already exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existingSubscription) {
    // Update existing subscription
    const { error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log(`Updated subscription for user ${userId} to ${tier}`);
    }
  } else {
    // Create new subscription
    const { error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData);

    if (error) {
      console.error('Error creating subscription:', error);
    } else {
      console.log(`Created new subscription for user ${userId} with tier ${tier}`);
    }
  }

  // Store/update Stripe customer ID in profiles table
  await supabase
    .from('profiles')
    .update({ 
      stripe_customer_id: subscription.customer as string,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  // Reset usage tracking for the new billing period
  await supabase
    .from('usage_tracking')
    .delete()
    .eq('user_id', userId);

  console.log(`Successfully processed subscription for user ${userId} with tier ${tier}`);
}
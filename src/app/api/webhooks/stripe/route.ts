import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Add comprehensive logging
  console.log('🚀 Webhook received at:', new Date().toISOString());
  
  const body = await request.text();
  console.log('📦 Raw body length:', body.length);
  
  let event;
  try {
    event = JSON.parse(body);
    console.log('✅ Event type:', event.type);
    console.log('📋 Event ID:', event.id);
  } catch (err) {
    console.error('❌ Invalid JSON:', err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Log the full event for debugging (remove in production)
  console.log('🔍 Full event data:', JSON.stringify(event, null, 2));

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Processing checkout completion...');
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        console.log('🔄 Processing subscription update...');
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        console.log('❌ Processing subscription deletion...');
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('💥 Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  console.log('✅ Webhook processed successfully');
  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: any) {
  console.log('🔍 Checkout session data:', JSON.stringify(session, null, 2));
  
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  
  console.log('👤 User ID from metadata:', userId);
  console.log('🎯 Tier from metadata:', tier);
  console.log('🔗 Subscription ID:', session.subscription);
  console.log('👥 Customer ID:', session.customer);

  if (!userId || !tier || !session.subscription) {
    console.error('❌ Missing required data in checkout session');
    console.error('Missing:', { userId: !userId, tier: !tier, subscription: !session.subscription });
    return;
  }

  try {
    console.log('🔄 Retrieving subscription from Stripe...');
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    console.log('✅ Stripe subscription retrieved:', subscription.id);
    
    // Convert Unix timestamps to ISO strings (avoiding TypeScript issues)
    const startTimestamp = (subscription as any).current_period_start;
    const endTimestamp = (subscription as any).current_period_end;
    
    const startDate = new Date(startTimestamp * 1000).toISOString();
    const endDate = new Date(endTimestamp * 1000).toISOString();
    
    console.log('📅 Period start:', startDate);
    console.log('📅 Period end:', endDate);

    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer,
      status: subscription.status,
      tier: tier,
      current_period_start: startDate,
      current_period_end: endDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Saving to database:', subscriptionData);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData)
      .select();

    if (error) {
      console.error('❌ Database error:', error);
    } else {
      console.log('✅ Subscription saved successfully:', data);
    }
  } catch (error) {
    console.error('💥 Error processing checkout:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('🔄 Updating subscription:', subscription.id);
  
  try {
    // Convert Unix timestamps to ISO strings
    const startDate = new Date(subscription.current_period_start * 1000).toISOString();
    const endDate = new Date(subscription.current_period_end * 1000).toISOString();

    const updateData = {
      status: subscription.status,
      current_period_start: startDate,
      current_period_end: endDate,
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Update data:', updateData);

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id)
      .select();

    if (error) {
      console.error('❌ Error updating subscription:', error);
    } else {
      console.log('✅ Subscription updated:', data);
    }
  } catch (error) {
    console.error('💥 Error in subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('❌ Canceling subscription:', subscription.id);
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
      .select();

    if (error) {
      console.error('❌ Error canceling subscription:', error);
    } else {
      console.log('✅ Subscription canceled:', data);
    }
  } catch (error) {
    console.error('💥 Error in subscription deletion:', error);
  }
}
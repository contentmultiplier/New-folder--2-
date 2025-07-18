import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('🚀 Webhook received at:', new Date().toISOString());
  
  try {
    const body = await request.text();
    console.log('📦 Raw body length:', body.length);
    
    // Parse the event
    let event: any;
    try {
      event = JSON.parse(body);
      console.log('✅ Event type:', event.type);
      console.log('📋 Event ID:', event.id);
    } catch (err) {
      console.error('❌ Invalid JSON:', err);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Log the event data for debugging
    console.log('🔍 Event data:', JSON.stringify(event.data.object, null, 2));

    // Handle different event types
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

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' }, 
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log('🔍 Processing checkout session:', session.id);
  
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  
  console.log('👤 User ID from metadata:', userId);
  console.log('🎯 Tier from metadata:', tier);
  console.log('🔗 Subscription ID:', session.subscription);
  console.log('👥 Customer ID:', session.customer);

  if (!userId || !tier || !session.subscription) {
    console.error('❌ Missing required data in checkout session');
    console.error('Missing data:', { 
      userId: !userId, 
      tier: !tier, 
      subscription: !session.subscription 
    });
    return;
  }

  try {
    console.log('🔄 Retrieving subscription from Stripe...');
    
    // Use fetch to call Stripe API instead of Stripe SDK
    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/subscriptions/${session.subscription}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!stripeResponse.ok) {
      throw new Error(`Stripe API error: ${stripeResponse.status}`);
    }

    const subscription = await stripeResponse.json();
    
    console.log('✅ Stripe subscription retrieved:', subscription.id);
    console.log('📅 Period start:', subscription.current_period_start);
    console.log('📅 Period end:', subscription.current_period_end);

    // Prepare subscription data for database
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer,
      status: subscription.status,
      tier: tier,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Saving subscription to database:', subscriptionData);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    } else {
      console.log('✅ Subscription saved successfully:', data);
    }
  } catch (error) {
    console.error('💥 Error processing checkout:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('🔄 Updating subscription:', subscription.id);
  
  try {
    const updateData = {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Updating subscription in database:', updateData);

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id)
      .select();

    if (error) {
      console.error('❌ Error updating subscription:', error);
      throw error;
    } else {
      console.log('✅ Subscription updated successfully:', data);
    }
  } catch (error) {
    console.error('💥 Error in subscription update:', error);
    throw error;
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
      throw error;
    } else {
      console.log('✅ Subscription canceled successfully:', data);
    }
  } catch (error) {
    console.error('💥 Error in subscription deletion:', error);
    throw error;
  }
}

// Also export other HTTP methods to avoid 405 errors
export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' }, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
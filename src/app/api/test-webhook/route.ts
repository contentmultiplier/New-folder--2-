// app/api/test-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('=== TEST WEBHOOK STARTED ===');
  
  try {
    // Log environment variables (safely)
    const envCheck = {
      stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
      webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    console.log('Environment check:', envCheck);

    const body = await request.json();
    const { event, skipSignatureCheck } = body;
    
    console.log('Test event received:', event.type, event.id);
    console.log('Skip signature check:', skipSignatureCheck);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    console.log('Supabase client created');

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing test checkout.session.completed');
        const session = event.data.object;
        
        console.log('Session details:', {
          id: session.id,
          mode: session.mode,
          subscription: session.subscription,
          metadata: session.metadata
        });

        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.userId;
          const tier = session.metadata?.tier;

          console.log('User ID:', userId);
          console.log('Tier:', tier);

          if (!userId || !tier) {
            throw new Error('Missing userId or tier in session metadata');
          }

          // Test database connection by checking if user exists
          console.log('Checking if user exists in profiles...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('id', userId)
            .single();

          if (profileError) {
            console.error('Profile query error:', profileError);
            throw new Error(`Profile not found: ${profileError.message}`);
          }

          console.log('Profile found:', profile);

          // Test creating subscription record
          console.log('Testing subscription creation...');
          const subscriptionData = {
            user_id: userId,
            tier: tier,
            status: 'active',
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log('Subscription data:', subscriptionData);

          // Check if subscription already exists
          const { data: existingSubscription, error: selectError } = await supabase
            .from('subscriptions')
            .select('id, tier, status')
            .eq('user_id', userId)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error('Error checking existing subscription:', selectError);
            throw new Error(`Database query failed: ${selectError.message}`);
          }

          let subscriptionResult;
          if (existingSubscription) {
            console.log('Updating existing subscription:', existingSubscription);
            const { data, error } = await supabase
              .from('subscriptions')
              .update(subscriptionData)
              .eq('user_id', userId)
              .select();

            if (error) {
              console.error('Error updating subscription:', error);
              throw new Error(`Failed to update subscription: ${error.message}`);
            }
            subscriptionResult = { action: 'updated', data };
          } else {
            console.log('Creating new subscription...');
            const { data, error } = await supabase
              .from('subscriptions')
              .insert(subscriptionData)
              .select();

            if (error) {
              console.error('Error creating subscription:', error);
              throw new Error(`Failed to create subscription: ${error.message}`);
            }
            subscriptionResult = { action: 'created', data };
          }

          console.log('Subscription result:', subscriptionResult);

          return NextResponse.json({
            success: true,
            message: 'Test webhook processed successfully',
            details: {
              event_type: event.type,
              user_id: userId,
              tier: tier,
              profile: profile,
              subscription: subscriptionResult,
              env_check: envCheck
            }
          });
        }
        break;

      default:
        return NextResponse.json({
          success: true,
          message: `Test event ${event.type} received but not processed`,
          event_type: event.type
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Test webhook completed',
      event_type: event.type
    });

  } catch (error: any) {
    console.error('❌ Test webhook error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
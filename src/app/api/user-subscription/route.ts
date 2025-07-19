// app/api/user-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching subscription for user:', userId);

    // Get user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    // Get usage tracking for current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('content_jobs')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage:', usageError);
      // Don't fail the request for usage errors, just set to 0
    }

    // If no subscription found, user is on trial
    if (!subscription) {
      console.log('No subscription found, returning trial data');
      return NextResponse.json({
        tier: 'trial',
        status: 'active',
        jobs_used_this_month: usage?.content_jobs || 0,
        stripe_subscription_id: null,
        stripe_customer_id: null,
        created_at: null,
        updated_at: new Date().toISOString()
      });
    }

    console.log('Subscription found:', subscription.tier, subscription.status);

    return NextResponse.json({
      tier: subscription.tier,
      status: subscription.status,
      jobs_used_this_month: usage?.content_jobs || 0,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_customer_id: subscription.stripe_customer_id,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at
    });

  } catch (error: any) {
    console.error('User subscription API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
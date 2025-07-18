import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription from database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user's usage this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: jobsUsed, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (usageError) {
      console.error('Error fetching usage:', usageError);
    }

    // If no subscription found, user is on trial
    if (subscriptionError || !subscription) {
      // Check if user profile exists and get trial info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (profileError) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Calculate trial end date (7 days from signup)
      const trialEndDate = new Date(profile.created_at);
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      return NextResponse.json({
        tier: 'trial',
        status: 'active',
        current_period_end: trialEndDate.toISOString(),
        jobs_used_this_month: jobsUsed || 0,
        stripe_subscription_id: null,
        is_trial: true,
      });
    }

    // Return subscription data
    return NextResponse.json({
      tier: subscription.tier,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      jobs_used_this_month: jobsUsed || 0,
      stripe_subscription_id: subscription.stripe_subscription_id,
      is_trial: false,
    });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, jobType } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Record usage
    const { error } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        job_type: jobType || 'content_creation',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error recording usage:', error);
      return NextResponse.json(
        { error: 'Failed to record usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}
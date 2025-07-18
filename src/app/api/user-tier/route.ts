// app/api/user-tier/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUBSCRIPTION_TIERS, getTierInfo } from '@/lib/subscription-config';

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
      .eq('status', 'active')
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

    // Determine current tier
    let currentTier = 'trial';
    let subscriptionStatus = 'active';
    let periodEnd = null;

    if (subscription && !subscriptionError) {
      currentTier = subscription.tier;
      subscriptionStatus = subscription.status;
      periodEnd = subscription.current_period_end;
    } else {
      // User is on trial - get trial end date (7 days from signup)
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (profile) {
        const trialEnd = new Date(profile.created_at);
        trialEnd.setDate(trialEnd.getDate() + 7);
        periodEnd = trialEnd.toISOString();
      }
    }

    // Get tier configuration
    const tierInfo = getTierInfo(currentTier as keyof typeof SUBSCRIPTION_TIERS);

    // Calculate jobs remaining
    const jobsUsedCount = jobsUsed || 0;
    const jobsRemaining = tierInfo.jobLimit === -1 
      ? -1 // unlimited
      : Math.max(0, tierInfo.jobLimit - jobsUsedCount);

    // Return comprehensive tier information
    return NextResponse.json({
      tier: currentTier,
      status: subscriptionStatus,
      tierInfo: {
        name: tierInfo.name,
        price: tierInfo.price,
        jobLimit: tierInfo.jobLimit,
        platformAccess: tierInfo.platformAccess,
        features: tierInfo.features
      },
      usage: {
        jobsUsed: jobsUsedCount,
        jobsRemaining: jobsRemaining,
        jobsLimit: tierInfo.jobLimit
      },
      subscription: {
        current_period_end: periodEnd,
        is_trial: currentTier === 'trial'
      },
      success: true
    });

  } catch (error) {
    console.error('User tier API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user tier information' },
      { status: 500 }
    );
  }
}
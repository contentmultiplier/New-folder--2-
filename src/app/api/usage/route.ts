// app/api/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTierInfo, hasJobsRemaining } from '@/lib/subscription-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Check user usage and limits
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

    // Get user's current tier directly from database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const currentTier = subscription?.tier || 'trial';
    const tierInfo = getTierInfo(currentTier as any);

    // Get usage for current month
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
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      );
    }

    const jobsUsedCount = jobsUsed || 0;
    const canCreateMore = hasJobsRemaining(currentTier as any, jobsUsedCount);
    const jobsRemaining = tierInfo.jobLimit === -1 
      ? -1 
      : Math.max(0, tierInfo.jobLimit - jobsUsedCount);

    return NextResponse.json({
      usage: {
        jobsUsed: jobsUsedCount,
        jobsRemaining: jobsRemaining,
        jobsLimit: tierInfo.jobLimit,
        canCreateMore: canCreateMore
      },
      tier: currentTier,
      tierInfo: tierInfo,
      success: true
    });

  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    );
  }
}

// POST - Record usage (when user creates content)
export async function POST(request: NextRequest) {
  try {
    const { userId, jobType, contentTitle } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // First check if user can create more content directly from database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const currentTier = subscription?.tier || 'trial';
    const tierInfo = getTierInfo(currentTier as any);

    // Get current usage for this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: currentJobsUsed } = await supabase
      .from('usage_tracking')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString());

    const jobsUsedCount = currentJobsUsed || 0;

    // Check if user has exceeded their limit
    const canCreateMore = hasJobsRemaining(currentTier as any, jobsUsedCount);
    if (!canCreateMore) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          message: `You've reached your limit of ${tierInfo.jobLimit} jobs per month. Please upgrade your plan.`,
          usage: {
            jobsUsed: jobsUsedCount,
            jobsLimit: tierInfo.jobLimit,
            canCreateMore: false
          },
          requiresUpgrade: true
        },
        { status: 403 }
      );
    }

    // Record the usage
    const { data, error } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        action_type: jobType || 'content_creation',
        credits_used: 1,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording usage:', error);
      return NextResponse.json(
        { error: 'Failed to record usage' },
        { status: 500 }
      );
    }

    // Get updated usage count for this month
    const monthStart2 = new Date();
    monthStart2.setDate(1);
    monthStart2.setHours(0, 0, 0, 0);

    const { count: newJobsUsed } = await supabase
      .from('usage_tracking')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', monthStart2.toISOString());

    const newJobsUsedCount = newJobsUsed || 0;
    const newJobsRemaining = tierInfo.jobLimit === -1 
      ? -1 
      : Math.max(0, tierInfo.jobLimit - newJobsUsedCount);

    return NextResponse.json({
      usage: {
        jobsUsed: newJobsUsedCount,
        jobsRemaining: newJobsRemaining,
        jobsLimit: tierInfo.jobLimit,
        canCreateMore: hasJobsRemaining(currentTier as any, newJobsUsedCount)
      },
      recorded: data,
      message: 'Usage recorded successfully',
      success: true
    });

  } catch (error) {
    console.error('Usage recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record usage' },
      { status: 500 }
    );
  }
}

// DELETE - Reset usage (for testing)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete all usage records for the user
    const { error } = await supabase
      .from('usage_tracking')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting usage:', error);
      return NextResponse.json(
        { error: 'Failed to reset usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Usage reset successfully',
      success: true
    });

  } catch (error) {
    console.error('Usage reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset usage' },
      { status: 500 }
    );
  }
}
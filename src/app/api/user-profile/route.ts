import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use your existing Supabase setup pattern
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get user's subscription info
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get usage statistics
    const { data: usageStats, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage:', usageError);
    }

    // Get content statistics
    const { data: contentStats, error: contentError } = await supabase
      .from('content')
      .select('id, created_at, platforms_generated')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (contentError && contentError.code !== 'PGRST116') {
      console.error('Error fetching content:', contentError);
    }

    // Calculate statistics
    const totalContentJobs = contentStats?.length || 0;
    const totalUsageCredits = usageStats?.reduce((sum, usage) => sum + (usage.credits_used || 0), 0) || 0;
    
    // Calculate hours saved (estimate 3 hours per content job)
    const hoursSaved = totalContentJobs * 3;
    
    // Calculate total platforms optimized
    const totalPlatforms = contentStats?.reduce((sum, content) => {
      return sum + (content.platforms_generated ? content.platforms_generated.length : 0);
    }, 0) || 0;

    // Get subscription tier info
    let subscriptionTier = 'Free Trial';
    let usageLimit = 3;
    let usageUsed = totalUsageCredits;

    if (subscription) {
      subscriptionTier = subscription.tier || 'Free Trial';
      
      // Set usage limits based on tier
      switch (subscription.tier?.toLowerCase()) {
        case 'basic':
          usageLimit = 20;
          break;
        case 'pro':
          usageLimit = 100;
          break;
        case 'business':
          usageLimit = 500;
          break;
        case 'enterprise':
          usageLimit = 999999; // "unlimited"
          break;
        default:
          usageLimit = 3; // Free trial
      }
    }

    // Calculate usage for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthUsage = usageStats?.filter(usage => {
      const usageDate = new Date(usage.created_at);
      return usageDate.getMonth() === currentMonth && usageDate.getFullYear() === currentYear;
    }).reduce((sum, usage) => sum + (usage.credits_used || 0), 0) || 0;

    return NextResponse.json({
      // Basic profile info
      email: user.email,
      full_name: profile.full_name || '',
      avatar_url: profile.avatar_url || '',
      created_at: profile.created_at,
      
      // Subscription info
      subscription_tier: subscriptionTier,
      usage_limit: usageLimit,
      usage_used: currentMonthUsage,
      
      // Statistics
      total_content_jobs: totalContentJobs,
      hours_saved: hoursSaved,
      platforms_optimized: totalPlatforms,
      total_usage_credits: totalUsageCredits,
      
      // Subscription details
      subscription_status: subscription?.status || 'trial',
      subscription_period_start: subscription?.current_period_start || null,
      subscription_period_end: subscription?.current_period_end || null,
      stripe_customer_id: subscription?.stripe_customer_id || null
    });

  } catch (error) {
    console.error('Error in GET user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
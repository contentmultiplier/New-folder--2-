import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Look up the user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription lookup error:', subError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get user's usage data
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Usage lookup error:', usageError);
      // Continue without usage data
    }

    // Define tier limits
    const tierLimits = {
      trial: { jobs: 3, platforms: 2 },
      basic: { jobs: 20, platforms: 4 },
      pro: { jobs: 100, platforms: 5 },
      business: { jobs: 500, platforms: 6 },
      enterprise: { jobs: -1, platforms: 6 } // -1 means unlimited
    };

    // Determine current tier
    let currentTier = 'trial';
    let stripeSubscriptionId = null;
    let stripeCustomerId = null;
    let periodEnd = null;

    if (subscription) {
      currentTier = subscription.tier;
      stripeSubscriptionId = subscription.stripe_subscription_id;
      stripeCustomerId = subscription.stripe_customer_id;
      periodEnd = subscription.current_period_end;
    }

    // Get current usage
    const currentUsage = usage ? {
      jobs_used: usage.jobs_used || 0,
      current_period_start: usage.current_period_start,
      last_reset: usage.last_reset
    } : {
      jobs_used: 0,
      current_period_start: null,
      last_reset: null
    };

    // Return tier information
    return NextResponse.json({
      tier: currentTier,
      limits: tierLimits[currentTier as keyof typeof tierLimits],
      usage: currentUsage,
      subscription: {
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        status: subscription?.status || 'inactive',
        current_period_end: periodEnd
      }
    });

  } catch (error) {
    console.error('User tier API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
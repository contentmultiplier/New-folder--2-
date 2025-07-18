// lib/subscription-config.ts
export const SUBSCRIPTION_TIERS = {
  trial: {
    name: 'Free Trial',
    price: 0,
    jobLimit: 3,
    platformAccess: ['linkedin', 'twitter'],
    features: [
      '3 content transformations',
      '2 platforms (LinkedIn, Twitter)',
      'Basic AI processing',
      '7-day trial period'
    ]
  },
  basic: {
    name: 'Basic Plan',
    price: 29,
    jobLimit: 20,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram'],
    features: [
      '20 content transformations/month',
      '4 platforms access',
      'Enhanced AI processing',
      'Content library',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro Plan',
    price: 79,
    jobLimit: 100,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'],
    features: [
      '100 content transformations/month',
      '5 platforms access',
      'Advanced AI processing',
      'File upload processing',
      'Priority support',
      'Analytics dashboard'
    ]
  },
  business: {
    name: 'Business Plan',
    price: 199,
    jobLimit: 500,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'],
    features: [
      '500 content transformations/month',
      'All 6 platforms',
      'Team collaboration',
      'Advanced analytics',
      'API access',
      'Dedicated support'
    ]
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 499,
    jobLimit: -1, // unlimited
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'],
    features: [
      'Unlimited transformations',
      'All platforms',
      'White-label options',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee'
    ]
  }
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Helper function to get user tier info
export function getTierInfo(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.trial;
}

// Helper function to check if user can access platform
export function canAccessPlatform(tier: SubscriptionTier, platform: string): boolean {
  const tierInfo = getTierInfo(tier);
  return tierInfo.platformAccess.includes(platform);
}

// Helper function to check if user has jobs remaining
export function hasJobsRemaining(tier: SubscriptionTier, jobsUsed: number): boolean {
  const tierInfo = getTierInfo(tier);
  if (tierInfo.jobLimit === -1) return true; // unlimited
  return jobsUsed < tierInfo.jobLimit;
}
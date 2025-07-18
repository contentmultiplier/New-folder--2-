import Stripe from 'stripe';

// Server-side only: Stripe instance (only import this in API routes)
let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// Client-safe configuration (no environment variables)
export const SUBSCRIPTION_TIERS = {
  trial: {
    name: 'Free Trial',
    price: 0,
    priceId: null,
    features: [
      '3 content transformations',
      '2 platforms (LinkedIn + Twitter)',
      'Text input only',
      '7-day trial period'
    ],
    jobLimit: 3,
    platformAccess: ['linkedin', 'twitter'],
    hasVideoUpload: false,
    trialDays: 7,
  },
  basic: {
    name: 'ContentMultiplier Basic',
    price: 29,
    priceId: 'prod_ShTs9fA0aP6Yp2',
    features: [
      '20 content transformations/month',
      '4 platforms (LinkedIn, Twitter, Facebook, Instagram)',
      'Text input only',
      'Basic support',
      'Content library'
    ],
    jobLimit: 20,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram'],
    hasVideoUpload: false,
  },
  pro: {
    name: 'ContentMultiplier Pro',
    price: 79,
    priceId: 'prod_ShTsqMfbpk6t1R',
    features: [
      '100 content transformations/month',
      'ALL 5 platforms (LinkedIn, Twitter, Facebook, Instagram, YouTube)',
      'Video/Audio upload support',
      'Priority support',
      'Advanced analytics'
    ],
    jobLimit: 100,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'],
    hasVideoUpload: true,
  },
  business: {
    name: 'ContentMultiplier Business',
    price: 199,
    priceId: 'prod_ShTs7HVVCmLDbc',
    features: [
      '500 content transformations/month',
      'ALL 5 platforms',
      'Video/Audio upload support',
      'Team features',
      'Custom integrations',
      'Dedicated support'
    ],
    jobLimit: 500,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'],
    hasVideoUpload: true,
  },
  enterprise: {
    name: 'ContentMultiplier Enterprise',
    price: 499,
    priceId: 'prod_ShTs6OAqDAkzoJ',
    features: [
      'Unlimited transformations',
      'ALL platforms',
      'Video/Audio upload support',
      'White-label options',
      'API access',
      'Dedicated support'
    ],
    jobLimit: -1,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'],
    hasVideoUpload: true,
  },
};

// Helper functions (client-safe)
export function getUserTierLimits(tier: string | null) {
  if (!tier || tier === 'trial') {
    return SUBSCRIPTION_TIERS.trial;
  }
  
  return SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.trial;
}

export function canAccessPlatform(userTier: string | null, platform: string) {
  const tierLimits = getUserTierLimits(userTier);
  return tierLimits.platformAccess.includes(platform.toLowerCase());
}

export function canUploadVideo(userTier: string | null) {
  const tierLimits = getUserTierLimits(userTier);
  return tierLimits.hasVideoUpload;
}
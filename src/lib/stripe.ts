import Stripe from 'stripe';

// Server-side Stripe initialization
function createStripeInstance() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
  });
}

// Export stripe instance (only use on server-side)
export const getStripe = () => createStripeInstance();

// Client-safe Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
};

// Subscription tier configuration (client-safe)
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
    priceId: 'price_1RkJWJF9hnElfa3LLkSIttrw',
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
    priceId: 'price_1RkJYNF9hnElfa3L22s4YRWT',
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
    priceId: 'price_1RkJZXF9hnElfa3LRSS2JdoZ',
    features: [
      '500 content transformations/month',
      'ALL 6 platforms (LinkedIn, Twitter, Facebook, Instagram, YouTube, TikTok)',
      'Video/Audio upload support',
      'Team features',
      'Custom integrations',
      'Dedicated support'
    ],
    jobLimit: 500,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'],
    hasVideoUpload: true,
  },
  enterprise: {
    name: 'ContentMultiplier Enterprise',
    price: 499,
    priceId: 'price_1RkJaEF9hnElfa3LeQO36jbA',
    features: [
      'Unlimited transformations',
      'ALL 6 platforms (LinkedIn, Twitter, Facebook, Instagram, YouTube, TikTok)',
      'Video/Audio upload support',
      'White-label options',
      'API access',
      'Dedicated support'
    ],
    jobLimit: -1,
    platformAccess: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'],
    hasVideoUpload: true,
  },
};

// Helper function to get user's subscription tier
export function getUserTierLimits(tier: string | null) {
  if (!tier || tier === 'trial') {
    return SUBSCRIPTION_TIERS.trial;
  }
  
  return SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.trial;
}

// Helper function to check if user can access a platform
export function canAccessPlatform(userTier: string | null, platform: string) {
  const tierLimits = getUserTierLimits(userTier);
  return tierLimits.platformAccess.includes(platform.toLowerCase());
}

// Helper function to check if user can upload videos
export function canUploadVideo(userTier: string | null) {
  const tierLimits = getUserTierLimits(userTier);
  return tierLimits.hasVideoUpload;
}
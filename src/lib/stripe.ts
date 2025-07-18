// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe Product and Price IDs (you'll need to create these in Stripe Dashboard)
export const STRIPE_PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC || 'price_basic_monthly',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly', 
  business: process.env.STRIPE_PRICE_BUSINESS || 'price_business_monthly',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
};

// Match your existing subscription tiers with Stripe prices
export const SUBSCRIPTION_TIERS_WITH_STRIPE = {
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
    ],
    stripePriceId: null, // No Stripe price for trial
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
    ],
    stripePriceId: STRIPE_PRICES.basic,
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
    ],
    stripePriceId: STRIPE_PRICES.pro,
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
    ],
    stripePriceId: STRIPE_PRICES.business,
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
    ],
    stripePriceId: STRIPE_PRICES.enterprise,
  }
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS_WITH_STRIPE;
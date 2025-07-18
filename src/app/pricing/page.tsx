'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { useRouter } from 'next/navigation';

const PLATFORM_ICONS = {
  linkedin: '💼',
  twitter: '🐦',
  facebook: '📘',
  instagram: '📸',
  youtube: '📺',
};

const PLATFORM_NAMES = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string, priceId: string) => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setLoading(tier);

    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          tier,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(mod => 
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      );
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    { key: 'trial', ...SUBSCRIPTION_TIERS.trial, popular: false },
    { key: 'basic', ...SUBSCRIPTION_TIERS.basic, popular: false },
    { key: 'pro', ...SUBSCRIPTION_TIERS.pro, popular: true },
    { key: 'business', ...SUBSCRIPTION_TIERS.business, popular: false },
    { key: 'enterprise', ...SUBSCRIPTION_TIERS.enterprise, popular: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Content Power</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Transform your content creation workflow with AI-powered repurposing. 
            Save 15+ hours per week and reach more audiences across every platform.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-full mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:bg-white/20 flex flex-col ${
                tier.popular ? 'ring-2 ring-cyan-400 shadow-2xl shadow-cyan-400/20' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                  {tier.price > 0 && <span className="text-lg text-slate-300">/month</span>}
                </div>
                {tier.key === 'trial' && (
                  <p className="text-sm text-cyan-400">7 day trial</p>
                )}
              </div>

              {/* Platform Access */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-cyan-400 mb-3">PLATFORM ACCESS</h4>
                <div className="flex flex-wrap gap-2">
                  {tier.platformAccess.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-xs"
                    >
                      <span>{PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}</span>
                      <span className="text-white">{PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features - with flex-grow to push button down */}
              <div className="mb-8 flex-grow">
                <h4 className="text-sm font-semibold text-cyan-400 mb-3">FEATURES</h4>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button - Now at bottom with mt-auto */}
              <div className="mt-auto">
                <button
                  onClick={() => {
                    if (tier.key === 'trial') {
                      if (!user) {
                        router.push('/auth');
                      } else {
                        router.push('/dashboard');
                      }
                    } else if (tier.priceId) {
                      handleSubscribe(tier.key, tier.priceId);
                    }
                  }}
                  disabled={loading === tier.key}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white hover:shadow-lg hover:shadow-cyan-400/25'
                      : tier.key === 'enterprise'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-lg hover:shadow-yellow-400/25'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  } ${loading === tier.key ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === tier.key ? (
                    'Processing...'
                  ) : tier.key === 'trial' ? (
                    user ? 'Start Free Trial' : 'Sign Up Free'
                  ) : tier.key === 'enterprise' ? (
                    'Contact Sales'
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-2">Can I upgrade or downgrade anytime?</h4>
              <p className="text-slate-300 text-sm">Yes! You can change your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-2">What happens to my content after canceling?</h4>
              <p className="text-slate-300 text-sm">Your content remains accessible for 30 days after cancellation, giving you time to export.</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-2">Do you offer refunds?</h4>
              <p className="text-slate-300 text-sm">We offer a 7-day money-back guarantee on all paid plans.</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-2">Is my content data secure?</h4>
              <p className="text-slate-300 text-sm">Absolutely. We use enterprise-grade encryption and never share your content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
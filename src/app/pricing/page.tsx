'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-config';
import { useRouter } from 'next/navigation';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ContentMux Pricing - AI Content Repurposing Plans | Starting at $29/month',
  description: 'Choose the perfect ContentMux plan for your content needs. Transform content across 2-6 platforms with AI. Free trial available. Plans from $29-$499/month.',
  keywords: 'ContentMux pricing, AI content tool pricing, social media automation cost, content repurposing plans, AI content subscription',
  authors: [{ name: 'ContentMux' }],
  creator: 'ContentMux',
  publisher: 'ContentMux',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.contentmux.com/pricing',
    title: 'ContentMux Pricing Plans - AI Content Repurposing',
    description: 'Affordable AI-powered content repurposing plans. Free trial, then plans starting at $29/month.',
    siteName: 'ContentMux',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContentMux Pricing - AI Content Plans',
    description: 'Affordable AI content repurposing. Free trial available. Plans from $29/month.',
    creator: '@contentmux',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const PLATFORM_ICONS = {
  linkedin: '💼',
  twitter: '🐦',
  facebook: '📘',
  instagram: '📸',
  youtube: '📺',
  tiktok: '🎵',
};

const PLATFORM_NAMES = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setLoading(tier);

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          tier: tier,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(`Failed to start subscription: ${error.message}`);
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

        {/* Pricing Cards - Two Row Layout */}
        <div className="max-w-7xl mx-auto">
          {/* First Row: Trial, Basic, Pro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {tiers.slice(0, 3).map((tier) => (
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

                {/* Features */}
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

                {/* CTA Button */}
                <div className="mt-auto">
                  <button
                    onClick={() => {
                      if (tier.key === 'trial') {
                        if (!user) {
                          router.push('/auth');
                        } else {
                          router.push('/dashboard');
                        }
                      } else {
                        handleSubscribe(tier.key);
                      }
                    }}
                    disabled={loading === tier.key}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white hover:shadow-lg hover:shadow-cyan-400/25'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    } ${loading === tier.key ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === tier.key ? (
                      'Processing...'
                    ) : tier.key === 'trial' ? (
                      user ? 'Start Free Trial' : 'Sign Up Free'
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row: Business, Enterprise */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tiers.slice(3, 5).map((tier) => (
              <div
                key={tier.key}
                className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:bg-white/20 flex flex-col"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    ${tier.price}
                    <span className="text-lg text-slate-300">/month</span>
                  </div>
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

                {/* Features */}
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

                {/* CTA Button */}
                <div className="mt-auto">
                  <button
                    onClick={() => {
                      if (tier.key === 'enterprise') {
                        window.open('mailto:sales@contentmux.com?subject=Enterprise Plan Inquiry', '_blank');
                      } else {
                        handleSubscribe(tier.key);
                      }
                    }}
                    disabled={loading === tier.key}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      tier.key === 'enterprise'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-lg hover:shadow-yellow-400/25'
                        : 'bg-gradient-to-r from-emerald-400 to-blue-400 text-white hover:shadow-lg hover:shadow-emerald-400/25'
                    } ${loading === tier.key ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === tier.key ? (
                      'Processing...'
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
  <h4 className="font-semibold text-white mb-2">What happens when I cancel my subscription?</h4>
  <p className="text-slate-300 text-sm">
    You can cancel anytime with no penalties. When you cancel, you'll keep full access to all features until the end of your current billing period. No refunds are provided, but you get what you paid for.
  </p>
</div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h4 className="font-semibled text-white mb-2">Is my content data secure?</h4>
              <p className="text-slate-300 text-sm">Absolutely. We use enterprise-grade encryption and never share your content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ContentMux - AI-Powered Content Repurposing Tool | Save 15+ Hours Per Week',
  description: 'Transform one piece of content into multiple platform-optimized formats with AI. Repurpose blogs, videos, and podcasts for LinkedIn, Twitter, Facebook, Instagram, YouTube, and TikTok automatically.',
  keywords: 'AI content repurposing, social media automation, content multiplier, repurpose content, AI social media tool, content creation automation',
  authors: [{ name: 'ContentMux' }],
  creator: 'ContentMux',
  publisher: 'ContentMux',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.contentmux.com/',
    title: 'ContentMux - AI Content Repurposing Tool',
    description: 'Save 15+ hours per week by automatically repurposing content across all social platforms with AI.',
    siteName: 'ContentMux',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContentMux - AI Content Repurposing Tool',
    description: 'Transform one piece of content into multiple platform-optimized formats automatically.',
    creator: '@contentmux',
  },
  robots: {
    index: true,
    follow: true,
  },
}


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="relative container mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-5xl mx-auto">           

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Transform 
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> One Piece </span>
              of Content Into
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent"> Multiple Formats</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The only AI-powered content repurposing platform that saves creators 
              <span className="text-emerald-400 font-semibold"> 15+ hours per week</span>. 
              Transform podcasts, videos, and articles into platform-optimized content instantly.
            </p>

            {/* Platform Logos Section - NEW! */}
            <div className="mb-12">
              <p className="text-slate-400 text-sm mb-6 uppercase tracking-wide">Repurpose for all major platforms</p>
              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
                {/* LinkedIn */}
                <div className="group flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition duration-300">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">in</span>
                  </div>
                  <span className="text-slate-300 font-medium">LinkedIn</span>
                </div>

                {/* Twitter/X */}
                <div className="group flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition duration-300">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-sm">𝕏</span>
                  </div>
                  <span className="text-slate-300 font-medium">Twitter</span>
                </div>

                {/* Facebook */}
                <div className="group flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition duration-300">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">f</span>
                  </div>
                  <span className="text-slate-300 font-medium">Facebook</span>
                </div>

                {/* Instagram */}
                <div className="group flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition duration-300">
                  <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📷</span>
                  </div>
                  <span className="text-slate-300 font-medium">Instagram</span>
                </div>

                {/* YouTube */}
                <div className="group flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition duration-300">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">▶</span>
                  </div>
                  <span className="text-slate-300 font-medium">YouTube</span>
                </div>

                {/* TikTok */}
                <div className="group flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition duration-300">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-sm">🎵</span>
                  </div>
                  <span className="text-slate-300 font-medium">TikTok</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
<div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
  <a href="/auth" className="group relative">
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
    <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg px-10 py-4 rounded-xl hover:scale-105 transition duration-300">
      Start Your Free Trial
      <span className="ml-2">→</span>
    </div>
  </a>
  <a href="/pricing" className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl hover:bg-white/20 transition duration-300">
    <span className="mr-2">💰</span>
    View Pricing
  </a>
</div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map((index) => (
                    <div key={index} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-slate-900"></div>
                  ))}
                </div>
                <span className="text-sm">25,000+ creators</span>
              </div>
              <div className="text-sm">⭐⭐⭐⭐⭐ 4.9/5 rating</div>
              <div className="text-sm">🏆 #1 Content Tool 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powerful AI Features
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our cutting-edge AI transforms your content into platform-specific masterpieces
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl hover:bg-slate-800/70 transition duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Repurposing</h3>
                <p className="text-slate-300 mb-6">Transform long-form content into platform-optimized posts for Twitter, LinkedIn, Instagram, and more.</p>
                <div className="flex items-center text-blue-400 font-semibold">
                  <span>6 platforms supported</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl hover:bg-slate-800/70 transition duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🎙️</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Audio Transcription</h3>
                <p className="text-slate-300 mb-6">Upload podcasts, videos, or voice memos and get accurate transcriptions in seconds.</p>
                <div className="flex items-center text-purple-400 font-semibold">
                  <span>99% accuracy rate</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl hover:bg-slate-800/70 transition duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">#️⃣</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Hashtags</h3>
                <p className="text-slate-300 mb-6">Generate platform-specific hashtags that maximize reach and engagement automatically.</p>
                <div className="flex items-center text-pink-400 font-semibold">
                  <span>AI-optimized tags</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl hover:bg-slate-800/70 transition duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Content Analytics</h3>
                <p className="text-slate-300 mb-6">Track performance across platforms and optimize your content strategy with AI insights.</p>
                <div className="flex items-center text-emerald-400 font-semibold">
                  <span>Real-time metrics</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl hover:bg-slate-800/70 transition duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🗂️</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Content Library</h3>
                <p className="text-slate-300 mb-6">Store, organize, and manage all your repurposed content in one powerful dashboard.</p>
                <div className="flex items-center text-yellow-400 font-semibold">
                  <span>Unlimited storage</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl hover:bg-slate-800/70 transition duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
                <p className="text-slate-300 mb-6">Process hour-long content in under 60 seconds with our optimized AI pipeline.</p>
                <div className="flex items-center text-indigo-400 font-semibold">
                  <span>&lt; 60 second processing</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">15+</div>
              <div className="text-slate-300 text-lg">Hours Saved Weekly</div>
              <div className="text-slate-400 text-sm mt-1">Per Creator</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">25K+</div>
              <div className="text-slate-300 text-lg">Active Creators</div>
              <div className="text-slate-400 text-sm mt-1">Worldwide</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">375K+</div>
              <div className="text-slate-300 text-lg">Hours Saved Weekly</div>
              <div className="text-slate-400 text-sm mt-1">Total Impact</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-2">150K+</div>
              <div className="text-slate-300 text-lg">Content Pieces</div>
              <div className="text-slate-400 text-sm mt-1">Created</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-slate-300 text-lg">Customer</div>
              <div className="text-slate-300 text-lg">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Transform</span> Your Content Strategy?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Join thousands of creators and agencies who are already saving 15+ hours per week with ContentMux
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <a href="/auth" className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xl px-12 py-5 rounded-xl hover:scale-105 transition duration-300">
                Start Your Free Trial
                <div className="text-sm opacity-80 mt-1">3 free transformations • No credit card required</div>
              </div>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>No setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ContentMux",
            "description": "AI-powered content repurposing tool that transforms one piece of content into multiple platform-optimized formats, saving creators 15+ hours per week.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "29",
              "highPrice": "499",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "billingDuration": "P1M",
                "referenceQuantity": {
                  "@type": "QuantitativeValue",
                  "value": "1"
                }
              }
            },
            "creator": {
              "@type": "Organization",
              "name": "ContentMux"
            },
            "featureList": [
              "AI Content Repurposing",
              "Multi-Platform Optimization", 
              "LinkedIn Content Generation",
              "Twitter Content Generation",
              "Facebook Content Generation",
              "Instagram Content Generation",
              "YouTube Content Generation",
              "TikTok Content Generation",
              "Hashtag Generation",
              "Audio/Video Transcription"
            ]
          })
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <span className="text-white font-bold text-xl">ContentMux</span>
          </div>
          <p className="text-slate-400 mb-4">
            AI-powered content repurposing for the modern creator
          </p>
          <div className="flex justify-center gap-6 text-slate-400 text-sm">
            <span>© 2025 ContentMux</span>
            <span>•</span>
            <span>Built with Next.js</span>
            <span>•</span>
            <span>World leading content repurposing App ✅</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
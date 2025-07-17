import React from 'react'

export default function Home() {
  return (
    <div className="page-container">
      {/* Header */}
      <header className="premium-card mb-8 p-6">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">ContentMux</h1>
              <p className="text-slate-400 text-sm">AI-Powered Content Repurposing</p>
            </div>
          </div>
          <a href="/auth" className="premium-button">
            Get Started
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Transform One Piece of Content Into 
            <span className="gradient-text"> Multiple Formats</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto">
            Save 15+ hours per week by automatically repurposing your content for Twitter, LinkedIn, Instagram, Facebook, and YouTube
          </p>
          
          <div className="success-message max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">
              🎉 Basic App Successfully Deployed!
            </h3>
            <p>
              This is our foundation. We'll add features step by step.
            </p>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="premium-card p-8 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-3">Auto-Repurposing</h3>
            <p className="text-slate-300">Transform long-form content into platform-specific posts</p>
          </div>
          <div className="premium-card p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Analytics</h3>
            <p className="text-slate-300">Track performance and optimize your content strategy</p>
          </div>
          <div className="premium-card p-8 text-center">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-semibold mb-3">Content Library</h3>
            <p className="text-slate-300">Store and manage all your repurposed content</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center mb-16">
          <p className="text-slate-400 mb-4 text-lg">More features coming soon...</p>
          <div className="premium-card inline-block p-4">
            <div className="text-sm text-slate-300">
              Version 1.0 - Basic Deployment ✅
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="premium-card p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Content Strategy?</h3>
          <p className="text-slate-300 mb-8 text-lg">Join 1,000+ creators and agencies already saving hours every week</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth" className="premium-button text-lg px-8 py-4">
              Start Free Trial
            </a>
            <button className="premium-button-secondary text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="premium-card mt-16 p-6 text-center">
        <p className="text-slate-400">© 2024 ContentMux - Built with Next.js</p>
      </footer>
    </div>
  )
}
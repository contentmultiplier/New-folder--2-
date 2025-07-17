import React from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">ContentMultiplier</h1>
          <p className="text-blue-100">AI-Powered Content Repurposing</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform One Piece of Content Into Multiple Formats
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Save 15+ hours per week by automatically repurposing your content for Twitter, LinkedIn, Instagram, Facebook, and YouTube
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🎉 Basic App Successfully Deployed!
            </h3>
            <p className="text-green-700">
              This is our foundation. We'll add features step by step.
            </p>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🔄 Auto-Repurposing</h3>
            <p className="text-gray-600">Transform long-form content into platform-specific posts</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Analytics</h3>
            <p className="text-gray-600">Track performance and optimize your content strategy</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">💾 Content Library</h3>
            <p className="text-gray-600">Store and manage all your repurposed content</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">More features coming soon...</p>
          <div className="text-sm text-gray-400">
            Version 1.0 - Basic Deployment ✅
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 mt-8">
        <p className="text-gray-600">© 2024 ContentMultiplier - Built with Next.js</p>
      </footer>
    </div>
  )
}
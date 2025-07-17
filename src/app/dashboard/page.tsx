'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  original_content: string;
  content_type: string;
  created_at: string;
}

interface UsageStats {
  used: number;
  limit: number;
  tier: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    used: 0,
    limit: 3,
    tier: 'Free Trial'
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Mock data for now - we'll connect to real data later
  useEffect(() => {
    if (user) {
      // Simulate recent content
      setRecentContent([
        {
          id: '1',
          original_content: 'How to build a successful SaaS product...',
          content_type: 'Blog Post',
          created_at: '2024-07-15T10:30:00Z'
        },
        {
          id: '2',
          original_content: 'Top 10 productivity tips for creators...',
          content_type: 'Video Script',
          created_at: '2024-07-14T15:20:00Z'
        }
      ]);

      // Simulate usage stats
      setUsageStats({
        used: 2,
        limit: 3,
        tier: 'Free Trial'
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="premium-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsageColor = () => {
    const percentage = (usageStats.used / usageStats.limit) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-white/60 text-lg">
            Ready to transform your content into multiple platform-optimized formats?
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Usage Stats */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Usage This Month</h3>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                {usageStats.tier}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Content Jobs</span>
                <span className={`font-medium ${getUsageColor()}`}>
                  {usageStats.used} / {usageStats.limit}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((usageStats.used / usageStats.limit) * 100, 100)}%` }}
                ></div>
              </div>
              {usageStats.used >= usageStats.limit && (
                <p className="text-red-400 text-sm">
                  Upgrade to continue creating content
                </p>
              )}
            </div>
          </div>

          {/* Time Saved */}
          <div className="premium-card p-6">
            <h3 className="text-white font-semibold mb-4">Time Saved</h3>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">~6 hours</div>
              <p className="text-white/60 text-sm">
                Based on {usageStats.used} content transformations
              </p>
            </div>
          </div>

          {/* Quick Action */}
          <div className="premium-card p-6">
            <h3 className="text-white font-semibold mb-4">Quick Start</h3>
            <Link
              href="/create-content"
              className="premium-button w-full text-center block"
            >
              Create New Content ✨
            </Link>
          </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Content */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Content</h2>
              <Link 
                href="/history" 
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                View All →
              </Link>
            </div>
            
            {recentContent.length > 0 ? (
              <div className="space-y-4">
                {recentContent.map((item) => (
                  <div 
                    key={item.id}
                    className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-blue-400 text-sm font-medium">
                        {item.content_type}
                      </span>
                      <span className="text-white/40 text-xs">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {item.original_content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-white/40 mb-4">📝</div>
                <p className="text-white/60 mb-4">No content created yet</p>
                <Link href="/create-content" className="premium-button">
                  Create Your First Content
                </Link>
              </div>
            )}
          </div>

          {/* Getting Started / Tips */}
          <div className="premium-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Getting Started</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Upload Your Content</h4>
                  <p className="text-white/60 text-sm">
                    Paste text, upload audio/video files, or enter your content manually
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Choose Content Type</h4>
                  <p className="text-white/60 text-sm">
                    Select blog post, video script, podcast, or visual story format
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Get Platform Content</h4>
                  <p className="text-white/60 text-sm">
                    Receive optimized versions for Twitter, LinkedIn, Instagram, and more
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <span>💡</span>
                <span className="font-medium text-sm">Pro Tip</span>
              </div>
              <p className="text-white/60 text-sm">
                Upload longer content (like podcast transcripts) for the best results. 
                Our AI works better with more context!
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
'use client';

import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  original_content: string;
  content_type: string;
  created_at: string;
  platforms_generated?: string[];
}

interface UsageStats {
  used: number;
  limit: number;
  tier: string;
}

interface DashboardMetrics {
  totalContentGenerated: number;
  totalPlatformsUsed: number;
  avgProcessingTime: string;
  timeSaved: string;
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
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalContentGenerated: 0,
    totalPlatformsUsed: 0,
    avgProcessingTime: '45s',
    timeSaved: '0 hours'
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const supabase = createClient();

        // Fetch user subscription data
        const subscriptionResponse = await fetch(`/api/user-subscription?userId=${user.id}`);
        const subscriptionData = await subscriptionResponse.json();

        if (subscriptionResponse.ok) {
          const tierLimits = {
            trial: { jobs: 3, platforms: ['linkedin', 'twitter'] },
            basic: { jobs: 20, platforms: ['linkedin', 'twitter', 'facebook', 'instagram'] },
            pro: { jobs: 100, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'] },
            business: { jobs: 500, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'] },
            enterprise: { jobs: 999999, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'] },
          };

          const userTier = subscriptionData.tier || 'trial';
          const limits = tierLimits[userTier as keyof typeof tierLimits] || tierLimits.trial;

          setUsageStats({
            used: subscriptionData.jobs_used_this_month || 0,
            limit: limits.jobs,
            tier: userTier === 'trial' ? 'Free Trial' : userTier.charAt(0).toUpperCase() + userTier.slice(1)
          });
        }

        // Fetch recent content
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('id, original_content, content_type, created_at, platforms_generated')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (contentError) {
          console.error('Error fetching content:', contentError);
        } else {
          setRecentContent(contentData || []);
        }

        // Fetch all content for metrics
        const { data: allContentData, error: allContentError } = await supabase
          .from('content')
          .select('id, platforms_generated, created_at')
          .eq('user_id', user.id);

        if (!allContentError && allContentData) {
          // Calculate metrics
          const totalContentGenerated = allContentData.length;
          const totalPlatformsUsed = allContentData.reduce((total, item) => {
            return total + (Array.isArray(item.platforms_generated) ? item.platforms_generated.length : 1);
          }, 0);

          // Calculate average time saved (estimate 3 hours per piece of content)
          const hoursPerContent = 3;
          const totalTimeSaved = totalContentGenerated * hoursPerContent;

          setMetrics({
            totalContentGenerated,
            totalPlatformsUsed,
            avgProcessingTime: '45s', // This would need to be tracked in usage_tracking table
            timeSaved: totalTimeSaved > 0 ? `${totalTimeSaved} hour${totalTimeSaved > 1 ? 's' : ''}` : '0 hours'
          });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to default values
        setUsageStats({
          used: 0,
          limit: 3,
          tier: 'Free Trial'
        });
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-12 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h3>
            <p className="text-slate-300">Preparing your content workspace...</p>
          </div>
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
    if (percentage >= 90) return 'from-red-500 to-pink-500';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getUsageTextColor = () => {
    const percentage = (usageStats.used / usageStats.limit) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType?.toLowerCase()) {
      case 'blog_post':
        return '📖';
      case 'video_script':
        return '🎬';
      case 'podcast':
        return '🎙️';
      case 'visual_story':
        return '📸';
      default:
        return '📝';
    }
  };

  const formatContentType = (contentType: string) => {
    if (!contentType) return 'Content';
    return contentType.charAt(0).toUpperCase() + contentType.slice(1).replace('_', ' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Welcome Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-medium">Dashboard Active</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome back, 
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {user.email?.split('@')[0]}
              </span>! 👋
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Your AI-powered content workspace is ready. Transform your ideas into platform-optimized content in seconds.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            
            {/* Usage Stats */}
            <div className="group relative col-span-1 md:col-span-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Usage This Month</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                      {usageStats.tier}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-lg">Content Jobs</span>
                    <span className={`font-bold text-2xl ${getUsageTextColor()}`}>
                      {usageStats.used} / {usageStats.limit}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-slate-700/50 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${getUsageColor()} h-3 rounded-full transition-all duration-500 relative overflow-hidden`}
                        style={{ width: `${Math.min((usageStats.used / usageStats.limit) * 100, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {usageStats.used >= usageStats.limit ? (
                    <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-300 font-semibold">⚠️ Trial limit reached</p>
                      <p className="text-red-200 text-sm mt-1">Upgrade to continue creating content</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      {usageStats.limit - usageStats.used} jobs remaining in your trial
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Time Saved */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Time Saved</h3>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  ~{metrics.timeSaved}
                </div>
                <p className="text-slate-400 text-sm">
                  Based on {metrics.totalContentGenerated} transformation{metrics.totalContentGenerated !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-white font-semibold mb-4">Quick Start</h3>
                <Link
                  href="/create-content"
                  className="group relative inline-block w-full"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition duration-300">
                    Create Content
                  </div>
                </Link>
              </div>
            </div>

          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Content */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Recent Content</h2>
                  <Link 
                    href="/history" 
                    className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span className="mr-2">View All</span>
                    <div className="transform group-hover:translate-x-1 transition-transform">→</div>
                  </Link>
                </div>
                
                {recentContent.length > 0 ? (
                  <div className="space-y-4">
                    {recentContent.map((item, index) => {
                      const platformCount = Array.isArray(item.platforms_generated) ? item.platforms_generated.length : 1;
                      const contentTypeIcon = getContentTypeIcon(item.content_type);
                      
                      return (
                        <div 
                          key={item.id}
                          className="group relative"
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                          <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-lg p-6 hover:bg-slate-700/50 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                  index === 0 ? 'from-blue-400 to-purple-400' :
                                  index === 1 ? 'from-purple-400 to-pink-400' :
                                  'from-pink-400 to-red-400'
                                }`}></div>
                                <span className="text-blue-400 font-semibold flex items-center gap-2">
                                  <span>{contentTypeIcon}</span>
                                  {formatContentType(item.content_type)}
                                </span>
                              </div>
                              <span className="text-slate-400 text-sm">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed line-clamp-2">
                              {item.original_content}
                            </p>
                            <div className="mt-4 flex items-center text-slate-400 text-sm">
                              <span className="mr-4">📊 {platformCount} platform{platformCount > 1 ? 's' : ''}</span>
                              <span className="mr-4">🏷️ Hashtags included</span>
                              <span>⚡ Generated successfully</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-slate-600 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">📝</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">No content created yet</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                      Start your content creation journey by transforming your first piece of content
                    </p>
                    <Link href="/create-content" className="group relative inline-block">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-8 py-4 rounded-lg hover:scale-105 transition duration-300">
                        Create Your First Content
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Getting Started / Tips */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                <h2 className="text-3xl font-bold text-white mb-8">Getting Started</h2>
                
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Upload Your Content",
                      description: "Paste text, upload audio/video files, or enter your content manually",
                      gradient: "from-blue-500 to-purple-500",
                      icon: "📤"
                    },
                    {
                      step: 2,
                      title: "Choose Content Type",
                      description: "Select blog post, video script, podcast, or visual story format",
                      gradient: "from-purple-500 to-pink-500",
                      icon: "🎯"
                    },
                    {
                      step: 3,
                      title: "Get Platform Content",
                      description: "Receive optimized versions for Twitter, LinkedIn, Instagram, and more",
                      gradient: "from-pink-500 to-red-500",
                      icon: "🚀"
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
                          <span>{item.icon}</span>
                          {item.title}
                        </h4>
                        <p className="text-slate-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700/50">
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-sm">💡</span>
                      </div>
                      <span className="font-bold text-yellow-300 text-lg">Pro Tip</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Upload longer content (like podcast transcripts or full blog posts) for the best results. 
                      Our AI works better with more context and can create more engaging platform-specific content!
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Performance Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Avg Processing Time", value: metrics.avgProcessingTime, gradient: "from-blue-400 to-purple-400" },
              { label: "Platforms Generated", value: `${metrics.totalPlatformsUsed}`, gradient: "from-purple-400 to-pink-400" },
              { label: "Content Created", value: `${metrics.totalContentGenerated}`, gradient: "from-pink-400 to-red-400" },
              { label: "Success Rate", value: "100%", gradient: "from-emerald-400 to-blue-400" }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent mb-2`}>
                  {metric.value}
                </div>
                <div className="text-slate-400 text-sm">{metric.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
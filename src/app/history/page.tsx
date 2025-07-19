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
  platforms_generated: string[];
  file_type?: string;
  original_transcript?: string; // Added for video transcripts
  platform_content?: {
    [key: string]: string;
  };
  hashtags?: {
    [key: string]: string[];
  };
}

interface PlatformContentItem {
  id: string;
  content_id: string;
  platform: string;
  generated_text: string;
  metadata: {
    hashtags?: string[];
    generated_at?: string;
  };
}

export default function History() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>('trial'); // Added user tier tracking

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Fetch real data from Supabase (keeping original working structure)
  useEffect(() => {
    const fetchContentHistory = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Fetch user tier from profile (NEW)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setUserTier(profileData?.subscription_tier || 'trial');
        }

        // Fetch content with platform content (ORIGINAL WORKING QUERY)
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select(`
            id,
            original_content,
            content_type,
            created_at,
            platforms_generated,
            file_type,
            original_transcript,
            platform_content (
              id,
              content_id,
              platform,
              generated_text,
              metadata
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (contentError) {
          console.error('Error fetching content:', contentError);
          return;
        }

        // Transform the data to match our interface (ORIGINAL WORKING LOGIC)
        const transformedContent: ContentItem[] = (contentData || []).map(item => {
          const platformContent: { [key: string]: string } = {};
          const hashtags: { [key: string]: string[] } = {};

          // Process platform content
          if (item.platform_content) {
            item.platform_content.forEach((pc: PlatformContentItem) => {
              platformContent[pc.platform] = pc.generated_text;
              if (pc.metadata?.hashtags) {
                hashtags[pc.platform] = pc.metadata.hashtags;
              }
            });
          }

          return {
            id: item.id,
            original_content: item.original_content,
            content_type: item.content_type,
            created_at: item.created_at,
            platforms_generated: item.platforms_generated || [],
            file_type: item.file_type,
            original_transcript: item.original_transcript,
            platform_content: platformContent,
            hashtags: hashtags
          };
        });

        setContent(transformedContent);
      } catch (error) {
        console.error('Error fetching content history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentHistory();
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-12 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading History</h3>
            <p className="text-slate-300">Retrieving your content library...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user has Pro+ access for transcript viewing (NEW)
  const isProPlus = ['pro', 'business', 'enterprise'].includes(userTier.toLowerCase());

  // Helper function to check if content is video (NEW)
  const isVideoContent = (item: ContentItem) => {
    return item.file_type && ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'].includes(item.file_type.toLowerCase());
  };

  const filteredContent = content
    .filter(item => {
      const matchesSearch = item.original_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || item.content_type.toLowerCase().includes(filterType.toLowerCase());
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getPlatformConfig = (platform: string) => {
    const configs: { [key: string]: { icon: string, name: string, gradient: string, color: string } } = {
      twitter: { icon: '🐦', name: 'Twitter/X', gradient: 'from-blue-400 to-blue-600', color: 'text-blue-400' },
      linkedin: { icon: '💼', name: 'LinkedIn', gradient: 'from-blue-600 to-blue-800', color: 'text-blue-500' },
      instagram: { icon: '📸', name: 'Instagram', gradient: 'from-pink-500 to-purple-600', color: 'text-pink-400' },
      facebook: { icon: '👥', name: 'Facebook', gradient: 'from-blue-500 to-blue-700', color: 'text-blue-400' },
      youtube: { icon: '📺', name: 'YouTube', gradient: 'from-red-500 to-red-600', color: 'text-red-400' },
      tiktok: { icon: '🎵', name: 'TikTok', gradient: 'from-pink-400 to-red-500', color: 'text-pink-400' }
    };
    return configs[platform] || { icon: '📱', name: platform, gradient: 'from-gray-400 to-gray-600', color: 'text-gray-400' };
  };

  const getContentTypeConfig = (type: string) => {
    const configs: { [key: string]: { icon: string, gradient: string } } = {
      'blog_post': { icon: '📝', gradient: 'from-blue-500 to-purple-500' },
      'video_script': { icon: '🎬', gradient: 'from-purple-500 to-pink-500' },
      'podcast': { icon: '🎙️', gradient: 'from-pink-500 to-red-500' },
      'visual_story': { icon: '🖼️', gradient: 'from-emerald-500 to-blue-500' }
    };
    return configs[type] || { icon: '📄', gradient: 'from-gray-500 to-gray-700' };
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
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-medium">Content Library Active</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Content 
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> History</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              View, search, and manage all your AI-transformed content. Copy platform-optimized posts and hashtags with one click.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="group relative mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                      {content.length}
                    </div>
                    <div className="text-slate-400 text-sm">Total Content</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {content.reduce((total, item) => total + (item.platforms_generated?.length || 0), 0)}
                    </div>
                    <div className="text-slate-400 text-sm">Platform Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {content.length * 3}h
                    </div>
                    <div className="text-slate-400 text-sm">Time Saved</div>
                  </div>
                </div>
                <Link href="/create-content" className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition duration-300">
                    ✨ Create New Content
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="group relative mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Search */}
                <div className="group">
                  <label className="block text-slate-200 text-sm font-semibold mb-3">
                    <span className="flex items-center gap-2">
                      <span>🔍</span>
                      Search Content
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by content or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Filter by Type */}
                <div className="group">
                  <label className="block text-slate-200 text-sm font-semibold mb-3">
                    <span className="flex items-center gap-2">
                      <span>📂</span>
                      Content Type
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <option value="all">All Types</option>
                      <option value="blog_post">Blog Post</option>
                      <option value="video_script">Video Script</option>
                      <option value="podcast">Podcast</option>
                      <option value="visual_story">Visual Story</option>
                    </select>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Sort */}
                <div className="group">
                  <label className="block text-slate-200 text-sm font-semibold mb-3">
                    <span className="flex items-center gap-2">
                      <span>📊</span>
                      Sort By
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Content List */}
          {filteredContent.length > 0 ? (
            <div className="space-y-8">
              {filteredContent.map((item, index) => {
                const typeConfig = getContentTypeConfig(item.content_type);
                const isExpanded = selectedContent?.id === item.id;
                const platformCount = item.platforms_generated?.length || 0;
                const hasVideoTranscript = isVideoContent(item) && item.original_transcript && isProPlus; // NEW
                
                return (
                  <div key={item.id} className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                      
                      {/* Content Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${typeConfig.gradient} rounded-xl flex items-center justify-center`}>
                              <span className="text-xl">{typeConfig.icon}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <span className={`bg-gradient-to-r ${typeConfig.gradient} bg-clip-text text-transparent font-bold text-lg`}>
                                  {formatContentType(item.content_type)}
                                </span>
                                {/* NEW: Video + Transcript badge */}
                                {hasVideoTranscript && (
                                  <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
                                    <span className="text-emerald-400 text-xs">🎬</span>
                                    <span className="text-emerald-300 text-xs font-medium">Video + Transcript</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-slate-400 text-sm mt-1">
                                Created {formatDate(item.created_at)} • {platformCount} platform{platformCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-300 leading-relaxed line-clamp-3">
                            {item.original_content}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setSelectedContent(isExpanded ? null : item)}
                          className="group relative ml-6"
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                          <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition duration-300">
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </div>
                        </button>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-slate-700/50 pt-8 mt-8 space-y-8">
                          
                          {/* NEW: Video Transcript Section (Pro+ users only) */}
                          {hasVideoTranscript && (
                            <div>
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-sm">🎬</span>
                                </div>
                                <h4 className="text-2xl font-bold text-white">Video Transcript</h4>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
                                  <span className="text-emerald-400 text-xs">✨</span>
                                  <span className="text-emerald-300 text-xs font-medium">Pro+ Feature</span>
                                </div>
                              </div>
                              
                              <div className="group relative mb-8">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                                        <span className="text-lg">📝</span>
                                      </div>
                                      <span className="text-white font-semibold text-lg">Extracted Text</span>
                                    </div>
                                    <button
                                      onClick={() => copyToClipboard(item.original_transcript!, 'transcript')}
                                      className={`group relative transition-all duration-300 ${
                                        copiedPlatform === 'transcript' ? 'scale-110' : 'hover:scale-105'
                                      }`}
                                    >
                                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                      <div className="relative bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                                        {copiedPlatform === 'transcript' ? '✅ Copied!' : '📋 Copy Transcript'}
                                      </div>
                                    </button>
                                  </div>
                                  
                                  <div className="bg-slate-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
                                      {item.original_transcript}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Platform Content Section */}
                          <div>
                            <div className="flex items-center gap-3 mb-8">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-sm">🚀</span>
                              </div>
                              <h4 className="text-2xl font-bold text-white">Platform-Optimized Content</h4>
                            </div>
                            
                            {item.platforms_generated && item.platforms_generated.length > 0 ? (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {item.platforms_generated.map((platform) => {
                                  const platformConfig = getPlatformConfig(platform);
                                  const content = item.platform_content?.[platform] || 'Content not available';
                                  const hashtags = item.hashtags?.[platform] || [];
                                  const isCopied = copiedPlatform === platform;
                                  
                                  return (
                                    <div key={platform} className="group relative">
                                      <div className={`absolute -inset-1 bg-gradient-to-r ${platformConfig.gradient} rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300`}></div>
                                      <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 bg-gradient-to-r ${platformConfig.gradient} rounded-xl flex items-center justify-center`}>
                                              <span className="text-lg">{platformConfig.icon}</span>
                                            </div>
                                            <span className="text-white font-semibold text-lg">{platformConfig.name}</span>
                                          </div>
                                          <button
                                            onClick={() => copyToClipboard(content, platform)}
                                            className={`group relative transition-all duration-300 ${
                                              isCopied ? 'scale-110' : 'hover:scale-105'
                                            }`}
                                          >
                                            <div className={`absolute -inset-1 bg-gradient-to-r ${platformConfig.gradient} rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300`}></div>
                                            <div className={`relative bg-gradient-to-r ${platformConfig.gradient} text-white font-semibold px-4 py-2 rounded-lg text-sm`}>
                                              {isCopied ? '✅ Copied!' : '📋 Copy'}
                                            </div>
                                          </button>
                                        </div>
                                        
                                        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                                          <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
                                            {content}
                                          </p>
                                        </div>
                                        
                                        {hashtags.length > 0 && (
                                          <div className="flex flex-wrap gap-2">
                                            {hashtags.map((tag, tagIndex) => (
                                              <div key={tagIndex} className="group relative">
                                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${platformConfig.gradient} rounded-full opacity-50`}></div>
                                                <span className="relative bg-slate-800/80 text-white font-medium text-xs px-3 py-1.5 rounded-full border border-slate-600/50 hover:bg-slate-700/80 transition-all duration-200">
                                                  {tag}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-slate-400">No platform content available</p>
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl blur opacity-25"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-16 rounded-xl text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-600 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {searchTerm || filterType !== 'all' ? 'No matching content found' : 'No content created yet'}
                </h3>
                <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter settings to find your content'
                    : 'Start creating content to see your transformation history here'
                  }
                </p>
                <Link href="/create-content" className="group relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-8 py-4 rounded-lg hover:scale-105 transition duration-300">
                    ✨ Create Your First Content
                  </div>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
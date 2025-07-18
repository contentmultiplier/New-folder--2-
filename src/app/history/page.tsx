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
  platform_content: {
    twitter: string;
    linkedin: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  hashtags: {
    twitter: string[];
    linkedin: string[];
    instagram: string[];
    facebook: string[];
    tiktok: string[];
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

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Mock data for now - we'll connect to real database later
  useEffect(() => {
    if (user) {
      const mockContent: ContentItem[] = [
        {
          id: '1',
          original_content: 'How to build a successful SaaS product from scratch. This comprehensive guide covers everything from idea validation to scaling your business. We\'ll explore market research, MVP development, customer feedback loops, and strategic scaling approaches that have helped hundreds of startups achieve product-market fit and sustainable growth.',
          content_type: 'Blog Post',
          created_at: '2024-07-15T10:30:00Z',
          platform_content: {
            twitter: '🚀 Building a successful SaaS? Here\'s what I learned from 0 to $100K ARR:\n\n✅ Validate before you build\n✅ Talk to customers daily\n✅ Focus on one core feature\n✅ Price based on value\n\nThread below 👇',
            linkedin: 'After helping dozens of founders build successful SaaS products, I\'ve identified the key patterns that separate winners from failures.\n\nThe most successful founders don\'t just build features - they solve real problems that people are willing to pay for.',
            instagram: '✨ SaaS Success Formula ✨\n\n1️⃣ Find a real problem\n2️⃣ Validate with customers\n3️⃣ Build MVP fast\n4️⃣ Iterate based on feedback\n5️⃣ Scale what works\n\nWhat\'s your biggest SaaS challenge?',
            facebook: 'Building a SaaS product? Here are the 5 critical steps that determine success:\n\n1. Problem validation\n2. Customer discovery\n3. MVP development\n4. Feedback loops\n5. Strategic scaling',
            tiktok: '5 SaaS mistakes that kill startups:\n\n❌ Building without validation\n❌ Ignoring customer feedback\n❌ Over-engineering features\n❌ Wrong pricing strategy\n❌ No clear value prop'
          },
          hashtags: {
            twitter: ['#SaaS', '#Startup', '#Entrepreneur', '#TechTips'],
            linkedin: ['#SaaS', '#StartupLife', '#ProductManagement', '#TechLeadership'],
            instagram: ['#saas', '#startup', '#entrepreneur', '#techlife', '#businesstips'],
            facebook: ['#SaaS', '#StartupAdvice', '#TechBusiness'],
            tiktok: ['#saas', '#startup', '#techtips', '#entrepreneur', '#business']
          }
        },
        {
          id: '2',
          original_content: 'Top 10 productivity tips for content creators. Time management strategies that actually work and have been tested by thousands of creators. From batching content creation to automating workflows, these techniques will help you create more content in less time while maintaining quality and consistency.',
          content_type: 'Video Script',
          created_at: '2024-07-14T15:20:00Z',
          platform_content: {
            twitter: '⏰ 10 productivity hacks for creators:\n\n1. Batch similar tasks\n2. Use time blocking\n3. Automate repetitive work\n4. Set clear boundaries\n5. Track your energy levels\n\nWhich one changed your game? 👇',
            linkedin: 'As content creators, our time is our most valuable asset. Here are 10 productivity strategies that have transformed how I work and can do the same for you.',
            instagram: '🎯 PRODUCTIVITY TIPS FOR CREATORS 🎯\n\n✨ Batch content creation\n✨ Time block your calendar\n✨ Automate social posts\n✨ Set creative boundaries\n✨ Track energy patterns\n\nSave this post! 📌',
            facebook: 'Fellow creators! Here are my top 10 productivity tips that have helped me create more content in less time while maintaining quality.',
            tiktok: 'POV: You want to be more productive as a creator 📈\n\nTry these 5 game-changing tips:\n\n1. Batch filming days\n2. Template everything\n3. Automate posting\n4. Set boundaries\n5. Track what works'
          },
          hashtags: {
            twitter: ['#Productivity', '#ContentCreator', '#TimeManagement', '#CreatorTips'],
            linkedin: ['#Productivity', '#ContentCreation', '#CreatorEconomy', '#TimeManagement'],
            instagram: ['#productivity', '#contentcreator', '#creatorlife', '#timemanagement', '#tips'],
            facebook: ['#Productivity', '#ContentCreators', '#CreatorTips'],
            tiktok: ['#productivity', '#contentcreator', '#creatorhacks', '#timemanagement']
          }
        },
        {
          id: '3',
          original_content: 'The future of AI in marketing is here. How businesses are using artificial intelligence to revolutionize customer engagement, personalize experiences, and drive unprecedented growth. From predictive analytics to automated content creation, AI is transforming every aspect of modern marketing strategies.',
          content_type: 'Podcast',
          created_at: '2024-07-13T09:15:00Z',
          platform_content: {
            twitter: '🤖 AI is transforming marketing:\n\n• Personalized customer journeys\n• Predictive analytics\n• Automated content creation\n• Real-time optimization\n\nWhat AI tools are you using in your marketing? 🧵',
            linkedin: 'The marketing landscape is evolving rapidly with AI integration. Companies that embrace these technologies now will have a significant competitive advantage in the coming years.',
            instagram: '🚀 AI + MARKETING = GAME CHANGER 🚀\n\n🎯 Hyper-personalization\n📊 Predictive insights\n⚡ Automated workflows\n📈 Better ROI\n\nThe future is now! ✨',
            facebook: 'Exploring how AI is revolutionizing marketing strategies and customer engagement. The possibilities are endless for businesses ready to innovate.',
            tiktok: 'Marketing with AI be like:\n\n✅ Know your customer better\n✅ Predict what they want\n✅ Create content automatically\n✅ Optimize in real-time\n\nMind = blown 🤯'
          },
          hashtags: {
            twitter: ['#AIMarketing', '#MarTech', '#ArtificialIntelligence', '#DigitalMarketing'],
            linkedin: ['#AIMarketing', '#MarketingTech', '#DigitalTransformation', '#CustomerExperience'],
            instagram: ['#aimarketing', '#digitalmarketing', '#martech', '#ai', '#marketing'],
            facebook: ['#AIMarketing', '#DigitalMarketing', '#MarketingTech'],
            tiktok: ['#aimarketing', '#digitalmarketing', '#ai', '#martech', '#business']
          }
        }
      ];
      setContent(mockContent);
    }
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
      twitter: { icon: '🐦', name: 'Twitter', gradient: 'from-blue-400 to-blue-600', color: 'text-blue-400' },
      linkedin: { icon: '💼', name: 'LinkedIn', gradient: 'from-blue-600 to-blue-800', color: 'text-blue-500' },
      instagram: { icon: '📸', name: 'Instagram', gradient: 'from-pink-500 to-purple-600', color: 'text-pink-400' },
      facebook: { icon: '👥', name: 'Facebook', gradient: 'from-blue-500 to-blue-700', color: 'text-blue-400' },
      tiktok: { icon: '🎵', name: 'TikTok', gradient: 'from-pink-400 to-red-500', color: 'text-pink-400' }
    };
    return configs[platform] || { icon: '📱', name: platform, gradient: 'from-gray-400 to-gray-600', color: 'text-gray-400' };
  };

  const getContentTypeConfig = (type: string) => {
    const configs: { [key: string]: { icon: string, gradient: string } } = {
      'Blog Post': { icon: '📝', gradient: 'from-blue-500 to-purple-500' },
      'Video Script': { icon: '🎬', gradient: 'from-purple-500 to-pink-500' },
      'Podcast': { icon: '🎙️', gradient: 'from-pink-500 to-red-500' },
      'Visual Story': { icon: '🖼️', gradient: 'from-emerald-500 to-blue-500' }
    };
    return configs[type] || { icon: '📄', gradient: 'from-gray-500 to-gray-700' };
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
                      <option value="blog">Blog Post</option>
                      <option value="video">Video Script</option>
                      <option value="podcast">Podcast</option>
                      <option value="visual">Visual Story</option>
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
                              <span className={`bg-gradient-to-r ${typeConfig.gradient} bg-clip-text text-transparent font-bold text-lg`}>
                                {item.content_type}
                              </span>
                              <div className="text-slate-400 text-sm mt-1">
                                Created {formatDate(item.created_at)}
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
                            {isExpanded ? 'Hide Platforms' : 'View Platforms'}
                          </div>
                        </button>
                      </div>

                      {/* Platform Content (Expandable) */}
                      {isExpanded && (
                        <div className="border-t border-slate-700/50 pt-8 mt-8">
                          <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                              <span className="text-sm">🚀</span>
                            </div>
                            <h4 className="text-2xl font-bold text-white">Platform-Optimized Content</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {Object.entries(item.platform_content).map(([platform, content]) => {
                              const platformConfig = getPlatformConfig(platform);
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
                                    
                                    <div className="flex flex-wrap gap-2">
                                      {item.hashtags[platform as keyof typeof item.hashtags]?.map((tag, tagIndex) => (
                                        <div key={tagIndex} className="group relative">
                                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${platformConfig.gradient} rounded-full opacity-50`}></div>
                                          <span className="relative bg-slate-800/80 text-white font-medium text-xs px-3 py-1.5 rounded-full border border-slate-600/50 hover:bg-slate-700/80 transition-all duration-200">
                                            {tag}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
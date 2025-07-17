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
          original_content: 'How to build a successful SaaS product from scratch. This comprehensive guide covers everything from idea validation to scaling your business...',
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
          original_content: 'Top 10 productivity tips for content creators. Time management strategies that actually work...',
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
          original_content: 'The future of AI in marketing is here. How businesses are using artificial intelligence to revolutionize customer engagement...',
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="premium-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading your content history...</p>
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
      // You could add a toast notification here
      console.log(`${platform} content copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      twitter: '🐦',
      linkedin: '💼',
      instagram: '📸',
      facebook: '👥',
      tiktok: '🎵'
    };
    return icons[platform] || '📱';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Content History</h1>
          <p className="text-white/60 text-lg">
            View, search, and manage all your transformed content
          </p>
        </div>

        {/* Filters and Search */}
        <div className="premium-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Search Content</label>
              <input
                type="text"
                placeholder="Search by content or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Type */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Content Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="blog">Blog Post</option>
                <option value="video">Video Script</option>
                <option value="podcast">Podcast</option>
                <option value="visual">Visual Story</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

          </div>
        </div>

        {/* Content List */}
        {filteredContent.length > 0 ? (
          <div className="space-y-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="premium-card p-6">
                
                {/* Content Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                        {item.content_type}
                      </span>
                      <span className="text-white/40 text-sm">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-white/80 line-clamp-3 mb-4">
                      {item.original_content}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedContent(selectedContent?.id === item.id ? null : item)}
                    className="ml-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    {selectedContent?.id === item.id ? 'Hide' : 'View'} Platforms
                  </button>
                </div>

                {/* Platform Content (Expandable) */}
                {selectedContent?.id === item.id && (
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <h4 className="text-white font-medium mb-4">Platform-Optimized Content</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {Object.entries(item.platform_content).map(([platform, content]) => (
                        <div key={platform} className="border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getPlatformIcon(platform)}</span>
                              <span className="text-white font-medium capitalize">{platform}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(content, platform)}
                              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-white/70 text-sm mb-3 line-clamp-4">
                            {content}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.hashtags[platform as keyof typeof item.hashtags]?.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-white/10 text-white/60 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="premium-card p-12 text-center">
            <div className="text-white/40 text-6xl mb-6">📝</div>
            <h3 className="text-xl font-semibold text-white mb-4">
              {searchTerm || filterType !== 'all' ? 'No matching content found' : 'No content created yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter settings'
                : 'Start creating content to see your transformation history here'
              }
            </p>
            <Link href="/create-content" className="premium-button">
              Create Your First Content
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
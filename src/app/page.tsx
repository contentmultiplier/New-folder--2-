'use client'

import { useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Sparkles, 
  Zap, 
  Target, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Play,
  ArrowRight,
  Star,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook
} from "lucide-react"

// Sample demo content that shows immediately without API calls
const DEMO_CONTENT = {
  input: `Here's a comprehensive guide to building a successful content strategy in 2025. Content marketing has evolved dramatically, with creators now needing to produce 10x more content while maintaining quality. The key is strategic repurposing - taking one piece of high-quality content and transforming it into multiple formats optimized for different platforms.

AI-powered tools are revolutionizing how creators work, enabling them to save 15+ hours per week while actually improving content quality through intelligent optimization and platform-specific adaptations.`,
  
  results: {
    twitter: {
      content: "🧵 THREAD: The content marketing game changed in 2025\n\nCreators now need 10x more content but here's the secret that's saving us 15+ hours/week:\n\nStrategic repurposing with AI optimization 🚀\n\n1/7",
      hashtags: ["#ContentMarketing", "#AI", "#CreatorEconomy"],
      engagement_tip: "Post at 9 AM EST for maximum engagement",
      performance_score: 92
    },
    linkedin: {
      content: "Content creation efficiency is crucial for modern professionals.\n\nThe landscape has shifted dramatically - we're expected to produce 10x more content while maintaining quality. The solution? Strategic repurposing with AI-powered optimization.\n\nThis approach isn't just about quantity. It's about creating platform-specific content that resonates with each audience while maintaining your authentic voice.\n\nThe result: 15+ hours saved weekly, higher engagement rates, and consistent brand presence across all channels.",
      hashtags: ["#ContentStrategy", "#DigitalMarketing", "#Productivity"],
      engagement_tip: "Include a question to boost comments",
      performance_score: 88
    },
    instagram: {
      content: "Transform your content game with AI ✨\n\nGone are the days of manual repurposing. Smart creators are using AI to:\n• Save 15+ hours per week\n• Optimize for each platform\n• Maintain consistent voice\n• Boost engagement rates\n\nReady to level up? 🚀",
      hashtags: ["#ContentCreator", "#AI", "#SocialMediaTips", "#CreatorLife", "#ContentStrategy"],
      engagement_tip: "Use trending audio for 40% more reach",
      performance_score: 90
    },
    facebook: {
      content: "The content creation struggle is real, but there's a smarter way.\n\nInstead of spending hours manually adapting content for different platforms, successful creators are leveraging AI to do the heavy lifting.\n\nHere's what changes when you optimize your content strategy:\n✅ 15+ hours saved weekly\n✅ Higher engagement across all platforms\n✅ Consistent brand voice\n✅ More time for creativity\n\nThe future of content creation is here, and it's powered by intelligent automation.",
      hashtags: ["#ContentMarketing", "#SocialMediaStrategy"],
      engagement_tip: "Ask followers to share their biggest content challenge",
      performance_score: 85
    },
    youtube: {
      title: "How AI Content Repurposing Saves Creators 15+ Hours Per Week",
      description: "Discover the game-changing content strategy that's revolutionizing how creators work in 2025. Learn the exact process successful creators use to transform one piece of content into multiple platform-optimized formats.\n\nIn this video, we'll cover:\n• The strategic repurposing framework\n• AI optimization techniques\n• Platform-specific best practices\n• Real creator success stories\n\nTimestamps:\n0:00 Introduction\n2:15 The Content Multiplication Strategy\n5:30 AI Optimization Process\n8:45 Platform-Specific Tips\n12:00 Results & Case Studies",
      hashtags: ["#ContentCreation", "#AI", "#CreatorEconomy", "#SocialMediaStrategy"],
      engagement_tip: "Upload between 2-4 PM for optimal reach",
      performance_score: 94
    },
    strategic_insights: {
      best_performing_platform: "YouTube",
      optimal_posting_times: {
        twitter: "9:00 AM EST",
        linkedin: "8:00 AM EST",
        instagram: "6:00 PM EST",
        facebook: "1:00 PM EST",
        youtube: "3:00 PM EST"
      },
      cross_platform_strategy: "Lead with YouTube long-form content, then create Twitter thread for discussion, LinkedIn post for professionals, Instagram carousel for visual learners, and Facebook post for community building.",
      viral_potential: 87,
      content_series_suggestion: "Create a weekly 'Content Strategy Secrets' series showcasing different AI tools and techniques"
    }
  }
}

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStartDemo = () => {
    setShowDemo(true)
    setIsProcessing(true)
    setDemoStep(1)
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setDemoStep(2)
    }, 2000)
  }

  const resetDemo = () => {
    setShowDemo(false)
    setDemoStep(0)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200" variant="secondary">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Content Repurposing
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
          Upload Once,
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Publish Everywhere
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Transform one piece of content into <strong>5 platform-optimized formats</strong> with advanced AI intelligence. 
          Save <strong>15+ hours per week</strong> while boosting engagement across all channels.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
            onClick={handleStartDemo}
          >
            <Play className="w-5 h-5 mr-2" />
            Try Free Demo
          </Button>
          <Link href="/auth">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-8 text-slate-600 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>10,000+ creators</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>150,000+ hours saved</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>4.9/5 rating</span>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            See ContentMux in Action
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Watch how one piece of content becomes 5 platform-optimized posts in under 30 seconds
          </p>
        </div>

        {!showDemo ? (
          /* Demo Preview */
          <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-blue-200">
            <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
              <Badge className="mx-auto mb-4 bg-green-100 text-green-800">
                <Zap className="w-4 h-4 mr-2" />
                LIVE DEMO - No Signup Required
              </Badge>
              <CardTitle className="text-2xl">Try the Magic Yourself</CardTitle>
              <CardDescription className="text-lg">
                Experience exactly how ContentMux transforms your content
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-white rounded-lg p-6 border border-slate-200 mb-6">
                <div className="text-lg font-semibold mb-4 block">Sample Content Input:</div>
                <div className="bg-slate-50 rounded p-4 text-sm text-slate-700 leading-relaxed">
                  {DEMO_CONTENT.input.substring(0, 200)}...
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                onClick={handleStartDemo}
              >
                <Play className="w-5 h-5 mr-2" />
                Transform This Content Now
              </Button>
              
              <p className="text-center text-slate-500 mt-4">
                ✨ This is a live demo - see real results in seconds
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Demo Results */
          <div className="max-w-6xl mx-auto">
            {demoStep === 1 && (
              <Card className="text-center p-8 shadow-2xl">
                <Badge className="mb-4 bg-blue-100 text-blue-800">
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  DEMO MODE - Processing with AI
                </Badge>
                <h3 className="text-2xl font-bold mb-4">AI is analyzing your content...</h3>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
                <p className="text-slate-600">Optimizing for 5 platforms • Generating strategic insights • Adding hashtag intelligence</p>
              </Card>
            )}

            {demoStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    DEMO COMPLETE - Real Results Below
                  </Badge>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">
                    🎉 Your Content Has Been Transformed!
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Here's what ContentMux generated for you in 2 seconds:
                  </p>
                  <Button onClick={resetDemo} variant="outline">
                    Try Another Demo
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Twitter */}
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Twitter className="w-5 h-5 text-blue-500" />
                          <CardTitle className="text-lg">Twitter Thread</CardTitle>
                        </div>
                        <Badge variant="secondary">Score: {DEMO_CONTENT.results.twitter.performance_score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded">
                        {DEMO_CONTENT.results.twitter.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {DEMO_CONTENT.results.twitter.hashtags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {DEMO_CONTENT.results.twitter.engagement_tip}
                      </p>
                    </CardContent>
                  </Card>

                  {/* LinkedIn */}
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-5 h-5 text-blue-700" />
                          <CardTitle className="text-lg">LinkedIn Post</CardTitle>
                        </div>
                        <Badge variant="secondary">Score: {DEMO_CONTENT.results.linkedin.performance_score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded">
                        {DEMO_CONTENT.results.linkedin.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {DEMO_CONTENT.results.linkedin.hashtags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {DEMO_CONTENT.results.linkedin.engagement_tip}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Instagram */}
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Instagram className="w-5 h-5 text-pink-500" />
                          <CardTitle className="text-lg">Instagram Post</CardTitle>
                        </div>
                        <Badge variant="secondary">Score: {DEMO_CONTENT.results.instagram.performance_score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded">
                        {DEMO_CONTENT.results.instagram.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {DEMO_CONTENT.results.instagram.hashtags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">+{DEMO_CONTENT.results.instagram.hashtags.length - 3} more</Badge>
                      </div>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {DEMO_CONTENT.results.instagram.engagement_tip}
                      </p>
                    </CardContent>
                  </Card>

                  {/* YouTube */}
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Youtube className="w-5 h-5 text-red-500" />
                          <CardTitle className="text-lg">YouTube Video</CardTitle>
                        </div>
                        <Badge variant="secondary">Score: {DEMO_CONTENT.results.youtube.performance_score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-2 text-sm">{DEMO_CONTENT.results.youtube.title}</h4>
                      <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded max-h-32 overflow-hidden">
                        {DEMO_CONTENT.results.youtube.description.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {DEMO_CONTENT.results.youtube.engagement_tip}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Facebook */}
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Facebook className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">Facebook Post</CardTitle>
                        </div>
                        <Badge variant="secondary">Score: {DEMO_CONTENT.results.facebook.performance_score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded">
                        {DEMO_CONTENT.results.facebook.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {DEMO_CONTENT.results.facebook.hashtags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {DEMO_CONTENT.results.facebook.engagement_tip}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Strategic Insights */}
                  <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200">
                    <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <CardTitle className="text-lg text-purple-800">Strategic Insights</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold text-purple-800">Best Platform:</span>
                          <p className="text-slate-700">{DEMO_CONTENT.results.strategic_insights.best_performing_platform} (Score: {DEMO_CONTENT.results.youtube.performance_score})</p>
                        </div>
                        <div>
                          <span className="font-semibold text-purple-800">Viral Potential:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" 
                                style={{width: `${DEMO_CONTENT.results.strategic_insights.viral_potential}%`}}
                              ></div>
                            </div>
                            <span className="text-purple-600 font-semibold">{DEMO_CONTENT.results.strategic_insights.viral_potential}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-purple-800">Strategy:</span>
                          <p className="text-slate-700 bg-purple-50 p-2 rounded text-xs">
                            {DEMO_CONTENT.results.strategic_insights.cross_platform_strategy.substring(0, 120)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                      🎉 This took 2 seconds and saved you 3+ hours of manual work!
                    </h4>
                    <p className="text-slate-600 mb-4">
                      Ready to transform your content creation process?
                    </p>
                    <Link href="/auth">
                      <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        Start Your Free Trial Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Why 10,000+ Creators Choose ContentMux
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The most advanced AI content repurposing platform built specifically for creators who want to scale without burnout.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced AI Intelligence</CardTitle>
                <CardDescription className="text-base">
                  Claude-4 powered content analysis with strategic insights and performance optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Brand voice consistency
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Performance scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Strategic recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-green-100 hover:border-green-300 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">5-Platform Optimization</CardTitle>
                <CardDescription className="text-base">
                  Perfect formatting, character limits, and engagement optimization for every platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Twitter threads & posts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    LinkedIn professional content
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Instagram, YouTube, Facebook
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Real-Time Analytics</CardTitle>
                <CardDescription className="text-base">
                  Track performance, optimize content, and make data-driven decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Content performance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Engagement optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Usage insights
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h3>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no setup costs.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <div className="text-3xl font-bold">$29<span className="text-lg text-slate-500">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    20 content transformations/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    5 platform optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Basic analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold">$79<span className="text-lg text-slate-500">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    100 content transformations/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Advanced AI insights
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Brand voice training
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <div className="text-3xl font-bold">$199<span className="text-lg text-slate-500">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    500 content transformations/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Team collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Custom integrations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-2">
              View All Plans & Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-4">
            Ready to Save 15+ Hours Per Week?
          </h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of creators who have transformed their content workflow with AI-powered repurposing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
              onClick={handleStartDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Try Demo Again
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">ContentMux</h1>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered content repurposing for creators who want to scale without burnout.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-700" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2025 ContentMux. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
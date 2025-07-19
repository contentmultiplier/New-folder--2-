import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Content - AI Content Repurposing Tool | ContentMux',
  description: 'Transform your content into platform-optimized posts for LinkedIn, Twitter, Facebook, Instagram, YouTube, and TikTok with AI. Upload text, video, or audio files.',
  keywords: 'create AI content, repurpose content online, AI social media posts, transform content platforms, content creation tool',
  authors: [{ name: 'ContentMux' }],
  creator: 'ContentMux',
  publisher: 'ContentMux',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.contentmux.com/create-content',
    title: 'Create AI-Optimized Content - ContentMux',
    description: 'Upload your content and get platform-specific versions for all social media channels instantly.',
    siteName: 'ContentMux',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create AI Content - ContentMux',
    description: 'Transform any content into platform-optimized social media posts with AI.',
    creator: '@contentmux',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CreateContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
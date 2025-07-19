import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ContentMux Pricing - AI Content Repurposing Plans | Starting at $29/month',
  description: 'Choose the perfect ContentMux plan for your content needs. Transform content across 2-6 platforms with AI. Free trial available. Plans from $29-$499/month.',
  keywords: 'ContentMux pricing, AI content tool pricing, social media automation cost, content repurposing plans, AI content subscription',
  authors: [{ name: 'ContentMux' }],
  creator: 'ContentMux',
  publisher: 'ContentMux',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.contentmux.com/pricing',
    title: 'ContentMux Pricing Plans - AI Content Repurposing',
    description: 'Affordable AI-powered content repurposing plans. Free trial, then plans starting at $29/month.',
    siteName: 'ContentMux',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContentMux Pricing - AI Content Plans',
    description: 'Affordable AI content repurposing. Free trial available. Plans from $29/month.',
    creator: '@contentmux',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
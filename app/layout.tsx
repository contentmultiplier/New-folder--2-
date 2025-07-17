import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ContentMux - AI-Powered Content Repurposing',
  description: 'Transform one piece of content into multiple platform-optimized formats. Save 15+ hours per week with AI-powered content repurposing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
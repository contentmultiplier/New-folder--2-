import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/lib/Navigation';
import GoogleAnalytics from '@/components/analytics';

const inter = Inter({ subsets: ['latin'] });

//Google SEO
export const metadata: Metadata = {
  title: 'ContentMux - AI-Powered Content Repurposing',
  description: 'Transform one piece of content into multiple platform-optimized formats. Save 15+ hours per week with AI-powered content repurposing.',
  verification: {
    google: 'ecF-zsIhenDSK0lKTEAoGOE3X7GJZeDir2cvSdMRswo',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
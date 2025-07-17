'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function BillingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="premium-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Billing & Usage</h1>
          <p className="text-white/60 text-lg">
            Manage your subscription and track your usage
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="premium-card p-12 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl font-bold text-white mb-4">Billing System Coming Soon</h2>
          <p className="text-white/60 mb-8 text-lg">
            We're working on implementing the full billing and subscription system with Stripe integration.
            This will include plan management, usage tracking, and billing history.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-medium mb-2">Current Status: Free Trial</h3>
              <p className="text-white/70 text-sm">You have access to 3 content transformations</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/settings" className="premium-button">
              Go to Settings
            </Link>
            <Link href="/create-content" className="premium-button-secondary">
              Create Content
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
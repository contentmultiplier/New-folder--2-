'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BillingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('usage');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white/60">Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Billing & Usage
              </span>
            </h1>
            <p className="text-slate-300 text-lg">
              Manage your subscription and track your content creation usage
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setActiveTab('usage')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'usage'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Usage & Plans
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'billing'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Billing History
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'payment'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Payment Methods
              </button>
            </div>
          </div>

          {/* Usage & Plans Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Current Plan</h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full">
                    <span className="text-emerald-300 text-sm font-medium">Free Trial</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">3</div>
                    <div className="text-slate-300 text-sm">Jobs Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">7</div>
                    <div className="text-slate-300 text-sm">Days Left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">$0</div>
                    <div className="text-slate-300 text-sm">Current Cost</div>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">This Month's Usage</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Content Jobs Used</span>
                    <span className="text-white font-medium">0 / 3</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">0</div>
                      <div className="text-slate-300 text-sm">LinkedIn Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">0</div>
                      <div className="text-slate-300 text-sm">Twitter Threads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">0</div>
                      <div className="text-slate-300 text-sm">Instagram Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">0</div>
                      <div className="text-slate-300 text-sm">Blog Articles</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Plans */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Upgrade Your Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Plan */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">Basic</h3>
                      <div className="text-3xl font-bold text-white mb-1">$29</div>
                      <div className="text-slate-300 text-sm mb-4">per month</div>
                      <div className="space-y-2 text-sm text-slate-300 mb-6">
                        <div>20 content jobs/month</div>
                        <div>All platforms</div>
                        <div>Basic support</div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 transition duration-300">
                        Coming Soon
                      </button>
                    </div>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/50 rounded-xl p-6 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
                      <div className="text-3xl font-bold text-white mb-1">$79</div>
                      <div className="text-slate-300 text-sm mb-4">per month</div>
                      <div className="space-y-2 text-sm text-slate-300 mb-6">
                        <div>100 content jobs/month</div>
                        <div>Advanced features</div>
                        <div>Priority support</div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 transition duration-300">
                        Coming Soon
                      </button>
                    </div>
                  </div>

                  {/* Business Plan */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">Business</h3>
                      <div className="text-3xl font-bold text-white mb-1">$199</div>
                      <div className="text-slate-300 text-sm mb-4">per month</div>
                      <div className="space-y-2 text-sm text-slate-300 mb-6">
                        <div>500 content jobs/month</div>
                        <div>Team features</div>
                        <div>Dedicated support</div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 transition duration-300">
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing History Tab */}
          {activeTab === 'billing' && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Billing History</h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-white mb-2">No Billing History</h3>
                <p className="text-slate-300 mb-6">
                  You're currently on the free trial. Your billing history will appear here once you upgrade to a paid plan.
                </p>
                <button
                  onClick={() => setActiveTab('usage')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition duration-300"
                >
                  View Plans
                </button>
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Payment Methods</h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-white mb-2">No Payment Methods</h3>
                <p className="text-slate-300 mb-6">
                  Add a payment method to upgrade your plan and continue creating content after your trial ends.
                </p>
                <button
                  onClick={() => setActiveTab('usage')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition duration-300"
                >
                  Choose a Plan
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/create-content" 
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-center py-3 px-6 rounded-lg hover:scale-105 transition duration-300">
                Create Content
              </div>
            </Link>
            <Link 
              href="/settings"
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white font-semibold text-center py-3 px-6 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition duration-300"
            >
              Account Settings
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
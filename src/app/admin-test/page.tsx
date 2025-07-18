'use client';

import { useState } from 'react';

const SUBSCRIPTION_TIERS = ['trial', 'basic', 'pro', 'business', 'enterprise'];

export default function AdminTestingPage() {
  const [userId, setUserId] = useState('');
  const [selectedTier, setSelectedTier] = useState('trial');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const executeTest = async (action: string, method: string, endpoint: string, body?: any) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      setResults({
        action,
        status: response.status,
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setResults({
        action,
        status: 'Error',
        success: false,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testUserTier = () => {
    if (!userId) {
      alert('Please enter a User ID');
      return;
    }
    executeTest('Get User Tier', 'GET', `/api/user-tier?userId=${userId}`);
  };

  const testUsage = () => {
    if (!userId) {
      alert('Please enter a User ID');
      return;
    }
    executeTest('Get Usage', 'GET', `/api/usage?userId=${userId}`);
  };

  const testCreateSubscription = () => {
    if (!userId) {
      alert('Please enter a User ID');
      return;
    }
    executeTest('Create/Update Subscription', 'POST', '/api/subscription', {
      userId,
      tier: selectedTier,
      action: 'create'
    });
  };

  const testRecordUsage = () => {
    if (!userId) {
      alert('Please enter a User ID');
      return;
    }
    executeTest('Record Usage', 'POST', '/api/usage', {
      userId,
      jobType: 'content_creation',
      contentTitle: 'Test Content'
    });
  };

  const testResetUsage = () => {
    if (!userId) {
      alert('Please enter a User ID');
      return;
    }
    executeTest('Reset Usage', 'DELETE', `/api/usage?userId=${userId}`);
  };

  const testCancelSubscription = () => {
    if (!userId) {
      alert('Please enter a User ID');
      return;
    }
    executeTest('Cancel Subscription', 'DELETE', `/api/subscription?userId=${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ContentMux Admin Testing
            </span>
          </h1>
          <p className="text-slate-300">Test subscription APIs without Stripe integration</p>
        </div>

        {/* Input Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                User ID (from your database)
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user UUID"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subscription Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              >
                {SUBSCRIPTION_TIERS.map(tier => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Info Tests */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
            <div className="space-y-3">
              <button
                onClick={testUserTier}
                disabled={loading}
                className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-300 py-2 px-4 rounded-lg hover:bg-blue-500/30 transition duration-200 disabled:opacity-50"
              >
                Get User Tier
              </button>
              <button
                onClick={testUsage}
                disabled={loading}
                className="w-full bg-green-500/20 border border-green-500/30 text-green-300 py-2 px-4 rounded-lg hover:bg-green-500/30 transition duration-200 disabled:opacity-50"
              >
                Check Usage
              </button>
            </div>
          </div>

          {/* Subscription Tests */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription Management</h3>
            <div className="space-y-3">
              <button
                onClick={testCreateSubscription}
                disabled={loading}
                className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-300 py-2 px-4 rounded-lg hover:bg-purple-500/30 transition duration-200 disabled:opacity-50"
              >
                Create/Update Subscription
              </button>
              <button
                onClick={testCancelSubscription}
                disabled={loading}
                className="w-full bg-red-500/20 border border-red-500/30 text-red-300 py-2 px-4 rounded-lg hover:bg-red-500/30 transition duration-200 disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Usage Tests */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Usage Tracking</h3>
            <div className="space-y-3">
              <button
                onClick={testRecordUsage}
                disabled={loading}
                className="w-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 py-2 px-4 rounded-lg hover:bg-cyan-500/30 transition duration-200 disabled:opacity-50"
              >
                Record Usage
              </button>
              <button
                onClick={testResetUsage}
                disabled={loading}
                className="w-full bg-orange-500/20 border border-orange-500/30 text-orange-300 py-2 px-4 rounded-lg hover:bg-orange-500/30 transition duration-200 disabled:opacity-50"
              >
                Reset Usage
              </button>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Test Results</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  results.success 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {results.success ? 'SUCCESS' : 'ERROR'}
                </span>
                <span className="text-slate-400 text-sm">{results.timestamp}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-slate-300 font-medium">Action:</span>
                <span className="text-white ml-2">{results.action}</span>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Status:</span>
                <span className="text-white ml-2">{results.status}</span>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Response:</span>
                <pre className="mt-2 bg-slate-900/50 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-white">Running test...</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Testing Instructions</h3>
          <div className="text-slate-300 space-y-2 text-sm">
            <p><strong>1. Get a User ID:</strong> Go to your Supabase database, find a user in the profiles table, and copy their UUID</p>
            <p><strong>2. Test User Info:</strong> Check their current tier and usage statistics</p>
            <p><strong>3. Create Subscription:</strong> Assign them a paid tier (basic, pro, business, enterprise)</p>
            <p><strong>4. Test Usage:</strong> Record usage to see if limits are enforced correctly</p>
            <p><strong>5. Reset/Cancel:</strong> Test cleanup functions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
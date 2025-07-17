'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserProfile {
  email: string;
  created_at: string;
  subscription_tier: string;
  usage_limit: number;
  usage_used: number;
}

interface Preferences {
  email_notifications: boolean;
  marketing_emails: boolean;
  default_content_type: string;
  default_processing_speed: string;
}

export default function Settings() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    email_notifications: true,
    marketing_emails: false,
    default_content_type: 'blog',
    default_processing_speed: 'balanced'
  });
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load user profile and preferences
  useEffect(() => {
    if (user) {
      // Mock data - we'll connect to real database later
      setUserProfile({
        email: user.email || '',
        created_at: '2024-07-01T00:00:00Z',
        subscription_tier: 'Free Trial',
        usage_limit: 3,
        usage_used: 2
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="premium-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const handleSavePreferences = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // You could add a success toast here
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free trial': return 'text-gray-400';
      case 'basic': return 'text-blue-400';
      case 'pro': return 'text-purple-400';
      case 'business': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'subscription', name: 'Subscription', icon: '💳' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60 text-lg">
            Manage your account, subscription, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="premium-card p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="premium-card p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Account Information</h2>
                
                <div className="space-y-6">
                  
                  {/* Profile Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">Email Address</label>
                      <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                        {userProfile.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">Member Since</label>
                      <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                        {formatDate(userProfile.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-medium text-white mb-4">Account Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">{userProfile.usage_used}</div>
                        <div className="text-white/60 text-sm">Content Jobs Used</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">~6</div>
                        <div className="text-white/60 text-sm">Hours Saved</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-400">5</div>
                        <div className="text-white/60 text-sm">Platforms Optimized</div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-red-500/20 pt-6">
                    <h3 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h3>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Delete Account</h4>
                          <p className="text-white/60 text-sm">Permanently delete your account and all data</p>
                        </div>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="premium-card p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Subscription & Billing</h2>
                
                <div className="space-y-6">
                  
                  {/* Current Plan */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">Current Plan</h3>
                        <p className="text-white/60">Your current subscription details</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionColor(userProfile.subscription_tier)} bg-current bg-opacity-20`}>
                        {userProfile.subscription_tier}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-white/60 text-sm">Monthly Limit</div>
                        <div className="text-white font-medium">{userProfile.usage_limit} content jobs</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm">Used This Month</div>
                        <div className="text-white font-medium">{userProfile.usage_used} / {userProfile.usage_limit}</div>
                      </div>
                    </div>

                    {userProfile.subscription_tier === 'Free Trial' && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                        <h4 className="text-blue-400 font-medium mb-2">Upgrade Your Plan</h4>
                        <p className="text-white/70 text-sm mb-3">
                          Get unlimited content transformations and advanced features
                        </p>
                        <button className="premium-button">
                          View Plans & Pricing
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Usage Breakdown */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Usage This Month</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60">Content Jobs</span>
                        <span className="text-white">{userProfile.usage_used} / {userProfile.usage_limit}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((userProfile.usage_used / userProfile.usage_limit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Billing History</h3>
                    <div className="bg-white/5 rounded-lg p-6 text-center">
                      <div className="text-white/40 text-4xl mb-4">📄</div>
                      <p className="text-white/60">No billing history available</p>
                      <p className="text-white/40 text-sm">You're currently on the free trial</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="premium-card p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  
                  {/* Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Email Notifications</h4>
                          <p className="text-white/60 text-sm">Receive updates about your content processing</p>
                        </div>
                        <button
                          onClick={() => setPreferences(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences.email_notifications ? 'bg-blue-500' : 'bg-white/20'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Marketing Emails</h4>
                          <p className="text-white/60 text-sm">Receive tips, updates, and promotional content</p>
                        </div>
                        <button
                          onClick={() => setPreferences(prev => ({ ...prev, marketing_emails: !prev.marketing_emails }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences.marketing_emails ? 'bg-blue-500' : 'bg-white/20'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              preferences.marketing_emails ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content Defaults */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-medium text-white mb-4">Content Defaults</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/60 text-sm font-medium mb-2">Default Content Type</label>
                        <select
                          value={preferences.default_content_type}
                          onChange={(e) => setPreferences(prev => ({ ...prev, default_content_type: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="blog">Blog Post</option>
                          <option value="video">Video Script</option>
                          <option value="podcast">Podcast</option>
                          <option value="visual">Visual Story</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/60 text-sm font-medium mb-2">Processing Speed</label>
                        <select
                          value={preferences.default_processing_speed}
                          onChange={(e) => setPreferences(prev => ({ ...prev, default_processing_speed: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="fast">Fast (Less detailed)</option>
                          <option value="balanced">Balanced (Recommended)</option>
                          <option value="quality">Quality (More detailed)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-white/10 pt-6">
                    <button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="premium-card p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Security</h2>
                
                <div className="space-y-6">
                  
                  {/* Password */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Password</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Change Password</h4>
                          <p className="text-white/60 text-sm">Update your account password</p>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Active Sessions</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Current Session</h4>
                          <p className="text-white/60 text-sm">This device • Active now</p>
                        </div>
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Sign Out</h4>
                          <p className="text-white/60 text-sm">Sign out of your account on this device</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
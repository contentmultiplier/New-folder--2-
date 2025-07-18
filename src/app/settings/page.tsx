'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface UserProfile {
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  subscription_tier: string;
  usage_limit: number;
  usage_used: number;
  total_content_jobs: number;
  hours_saved: number;
  platforms_optimized: number;
  subscription_status: string;
  subscription_period_start: string | null;
  subscription_period_end: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load user profile and preferences
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Get user session for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load user profile
      const profileResponse = await fetch('/api/user-profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      // Load user preferences
      const preferencesResponse = await fetch('/api/user-preferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        setPreferences(preferencesData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      
      // Get user session for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        // Show success message (you can add a toast notification here)
        console.log('Preferences saved successfully');
      } else {
        console.error('Failed to save preferences');
      }

    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);
      setPasswordError('');

      // Validate passwords
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      // Success - close modal and reset form
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Show success message (you can add a toast notification here)
      console.log('Password changed successfully');

    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIsEnabling2FA(true);

      // For now, we'll just simulate enabling 2FA
      // In a real implementation, you would:
      // 1. Generate QR code for authenticator app
      // 2. Verify user can generate codes
      // 3. Enable 2FA in the backend
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setIs2FAEnabled(true);
      
      // Show success message
      console.log('2FA enabled successfully');

    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsEnabling2FA(true);
      
      // Simulate disabling 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIs2FAEnabled(false);
      
      console.log('2FA disabled successfully');

    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    } finally {
      setIsEnabling2FA(false);
    }
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
      case 'free trial': return 'from-slate-500 to-slate-400';
      case 'basic': return 'from-blue-500 to-blue-400';
      case 'pro': return 'from-purple-500 to-purple-400';
      case 'business': return 'from-yellow-500 to-yellow-400';
      case 'enterprise': return 'from-emerald-500 to-emerald-400';
      default: return 'from-slate-500 to-slate-400';
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: '👤', gradient: 'from-blue-500 to-purple-500' },
    { id: 'subscription', name: 'Subscription', icon: '💳', gradient: 'from-purple-500 to-pink-500' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️', gradient: 'from-pink-500 to-red-500' },
    { id: 'security', name: 'Security', icon: '🔒', gradient: 'from-emerald-500 to-blue-500' }
  ];

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-12 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading Settings</h3>
            <p className="text-slate-300">Preparing your account preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-purple-300 text-sm font-medium">Account Settings</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Account 
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Settings
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Manage your account, subscription, and preferences all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
                  <nav className="space-y-3">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white scale-105'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/30 hover:scale-102'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activeTab === tab.id 
                            ? `bg-gradient-to-r ${tab.gradient}` 
                            : 'bg-slate-700/50'
                        }`}>
                          <span className="text-lg">{tab.icon}</span>
                        </div>
                        <span className="font-medium">{tab.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <span>👤</span>
                      </div>
                      Account Information
                    </h2>
                    
                    <div className="space-y-8">
                      
                      {/* Profile Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-slate-300 text-sm font-semibold mb-3">Email Address</label>
                          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-4 text-white font-medium">
                            {userProfile.email}
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-300 text-sm font-semibold mb-3">Member Since</label>
                          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-4 text-white font-medium">
                            {formatDate(userProfile.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Account Stats */}
                      <div className="border-t border-slate-700/50 pt-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>📊</span>
                          Account Statistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                            <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                {userProfile.total_content_jobs}
                              </div>
                              <div className="text-slate-300 text-sm font-medium">Content Jobs Created</div>
                            </div>
                          </div>
                          <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                            <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                {userProfile.hours_saved}
                              </div>
                              <div className="text-slate-300 text-sm font-medium">Hours Saved</div>
                            </div>
                          </div>
                          <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                            <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                {userProfile.platforms_optimized}
                              </div>
                              <div className="text-slate-300 text-sm font-medium">Platforms Optimized</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="border-t border-red-500/20 pt-8">
                        <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                          <span>⚠️</span>
                          Danger Zone
                        </h3>
                        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold text-lg mb-2">Delete Account</h4>
                              <p className="text-slate-300">Permanently delete your account and all data. This action cannot be undone.</p>
                            </div>
                            <button className="group relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                              <div className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition duration-300">
                                Delete Account
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <span>💳</span>
                      </div>
                      Subscription & Billing
                    </h2>
                    
                    <div className="space-y-8">
                      
                      {/* Current Plan */}
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                        <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">Current Plan</h3>
                              <p className="text-slate-300">Your current subscription details</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getSubscriptionColor(userProfile.subscription_tier)} text-white`}>
                              {userProfile.subscription_tier}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-slate-300 text-sm font-medium mb-1">Monthly Limit</div>
                              <div className="text-white font-bold text-lg">
                                {userProfile.usage_limit === 999999 ? 'Unlimited' : `${userProfile.usage_limit} content jobs`}
                              </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-slate-300 text-sm font-medium mb-1">Used This Month</div>
                              <div className="text-white font-bold text-lg">
                                {userProfile.usage_used} / {userProfile.usage_limit === 999999 ? '∞' : userProfile.usage_limit}
                              </div>
                            </div>
                          </div>

                          {userProfile.subscription_tier === 'Free Trial' && (
                            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
                              <h4 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
                                <span>🚀</span>
                                Upgrade Your Plan
                              </h4>
                              <p className="text-slate-300 mb-4 leading-relaxed">
                                Unlock unlimited content transformations, advanced features, and priority support with our premium plans.
                              </p>
                              <Link href="/pricing" className="group relative inline-block">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-lg hover:scale-105 transition duration-300">
                                  View Plans & Pricing
                                </div>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Usage Breakdown */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>📈</span>
                          Usage This Month
                        </h3>
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-300 font-medium">Content Jobs</span>
                            <span className="text-white font-bold text-lg">
                              {userProfile.usage_used} / {userProfile.usage_limit === 999999 ? '∞' : userProfile.usage_limit}
                            </span>
                          </div>
                          <div className="w-full bg-slate-600/50 rounded-full h-3 mb-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                              style={{ 
                                width: userProfile.usage_limit === 999999 
                                  ? '100%' 
                                  : `${Math.min((userProfile.usage_used / userProfile.usage_limit) * 100, 100)}%` 
                              }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                          <p className="text-slate-400 text-sm">
                            {userProfile.usage_limit === 999999 
                              ? 'Unlimited usage in your enterprise plan'
                              : `${userProfile.usage_limit - userProfile.usage_used} jobs remaining in your ${userProfile.subscription_tier.toLowerCase()}`
                            }
                          </p>
                        </div>
                      </div>

                      {/* Billing History */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>📄</span>
                          Billing History
                        </h3>
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📄</span>
                          </div>
                          <h4 className="text-white font-semibold text-lg mb-2">
                            {userProfile.subscription_tier === 'Free Trial' ? 'No billing history available' : 'Billing history coming soon'}
                          </h4>
                          <p className="text-slate-400">
                            {userProfile.subscription_tier === 'Free Trial' 
                              ? "You're currently on the free trial - no charges yet!"
                              : 'Billing history and invoice downloads will be available soon.'
                            }
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                        <span>⚙️</span>
                      </div>
                      Preferences
                    </h2>
                    
                    <div className="space-y-8">
                      
                      {/* Notifications */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>🔔</span>
                          Notifications
                        </h3>
                        <div className="space-y-6">
                          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-semibold text-lg mb-2">Email Notifications</h4>
                                <p className="text-slate-300">Receive updates about your content processing and account activity</p>
                              </div>
                              <button
                                onClick={() => setPreferences(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                                  preferences.email_notifications ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                                    preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-semibold text-lg mb-2">Marketing Emails</h4>
                                <p className="text-slate-300">Receive tips, product updates, and promotional content</p>
                              </div>
                              <button
                                onClick={() => setPreferences(prev => ({ ...prev, marketing_emails: !prev.marketing_emails }))}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                                  preferences.marketing_emails ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                                    preferences.marketing_emails ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Defaults */}
                      <div className="border-t border-slate-700/50 pt-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>🎯</span>
                          Content Defaults
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-3">Default Content Type</label>
                            <select
                              value={preferences.default_content_type}
                              onChange={(e) => setPreferences(prev => ({ ...prev, default_content_type: e.target.value }))}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="blog">📝 Blog Post</option>
                              <option value="video">🎥 Video Script</option>
                              <option value="podcast">🎙️ Podcast</option>
                              <option value="visual">📸 Visual Story</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-3">Processing Speed</label>
                            <select
                              value={preferences.default_processing_speed}
                              onChange={(e) => setPreferences(prev => ({ ...prev, default_processing_speed: e.target.value }))}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            >
                              <option value="fast">⚡ Fast (Less detailed)</option>
                              <option value="balanced">⚖️ Balanced (Recommended)</option>
                              <option value="quality">💎 Quality (More detailed)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="border-t border-slate-700/50 pt-8">
                        <button
                          onClick={handleSavePreferences}
                          disabled={isSaving}
                          className="group relative disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                          <div className="relative bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold px-8 py-4 rounded-lg hover:scale-105 transition duration-300 flex items-center gap-3">
                            {isSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <span>💾</span>
                                <span>Save Preferences</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <span>🔒</span>
                      </div>
                      Security
                    </h2>
                    
                    <div className="space-y-8">
                      
                      {/* Password */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>🔐</span>
                          Password
                        </h3>
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold text-lg mb-2">Change Password</h4>
                              <p className="text-slate-300">Update your account password for enhanced security</p>
                            </div>
                            <button 
                              onClick={() => setShowPasswordModal(true)}
                              className="group relative"
                            >
                              <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                              <div className="relative bg-slate-700/50 border border-slate-600/50 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-600/50 transition duration-300">
                                Change Password
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sessions */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>📱</span>
                          Active Sessions
                        </h3>
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                                <span>💻</span>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold text-lg">Current Session</h4>
                                <p className="text-slate-300">This device • Active now • Chrome on Windows</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                              <span className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>🛡️</span>
                          Two-Factor Authentication
                        </h3>
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold text-lg mb-2">Secure Your Account</h4>
                              <p className="text-slate-300">Add an extra layer of security with 2FA authentication</p>
                            </div>
                            <button 
                              onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
                              disabled={isEnabling2FA}
                              className="group relative disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className={`absolute -inset-1 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 ${
                                is2FAEnabled 
                                  ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                                  : 'bg-gradient-to-r from-emerald-500 to-blue-500'
                              }`}></div>
                              <div className={`relative text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition duration-300 flex items-center gap-2 ${
                                is2FAEnabled 
                                  ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                                  : 'bg-gradient-to-r from-emerald-500 to-blue-500'
                              }`}>
                                {isEnabling2FA ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>{is2FAEnabled ? 'Disabling...' : 'Enabling...'}</span>
                                  </>
                                ) : (
                                  <span>{is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}</span>
                                )}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-red-500/20 pt-8">
                        <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                          <span>🚪</span>
                          Session Management
                        </h3>
                        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold text-lg mb-2">Sign Out</h4>
                              <p className="text-slate-300">Sign out of your account on this device</p>
                            </div>
                            <button
                              onClick={handleLogout}
                              className="group relative"
                            >
                              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                              <div className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition duration-300">
                                Sign Out
                              </div>
                            </button>
                          </div>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span>🔐</span>
                  </div>
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {passwordError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <p className="text-red-300 text-sm">{passwordError}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-3">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-3">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-3">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-slate-700/50 border border-slate-600/50 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-600/50 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="flex-1 group relative disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition duration-300 flex items-center justify-center gap-2">
                      {isChangingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Changing...</span>
                        </>
                      ) : (
                        <span>Change Password</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
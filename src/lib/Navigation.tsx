'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface SubscriptionData {
  tier: string;
  status: string;
  jobs_used_this_month: number;
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/user-subscription?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        // Fallback to trial data
        setSubscriptionData({
          tier: 'trial',
          status: 'active',
          jobs_used_this_month: 0
        });
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get tier display info
  const getTierDisplayInfo = () => {
    if (!subscriptionData) {
      return { display: 'Loading...', jobsRemaining: '...' };
    }

    const tierLimits = {
      trial: { name: 'Free Trial', limit: 3 },
      basic: { name: 'Basic', limit: 20 },
      pro: { name: 'Pro', limit: 100 },
      business: { name: 'Business', limit: 500 },
      enterprise: { name: 'Enterprise', limit: 999999 }
    };

    const tierInfo = tierLimits[subscriptionData.tier as keyof typeof tierLimits] || tierLimits.trial;
    const jobsRemaining = tierInfo.limit - subscriptionData.jobs_used_this_month;

    return {
      display: tierInfo.name,
      jobsRemaining: tierInfo.limit === 999999 ? 'Unlimited' : `${jobsRemaining} jobs left`
    };
  };

  const tierInfo = getTierDisplayInfo();

  // Don't render navigation on auth page
  if (!mounted) {
    return (
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="text-white font-bold text-xl">ContentMux</span>
            </Link>

            {/* Loading placeholder */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-white/10 rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (pathname === '/auth') {
    return null;
  }

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Goes to dashboard when logged in, landing page when not */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <span className="text-white font-bold text-xl">ContentMux</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`transition-colors duration-200 ${
                    pathname === '/dashboard' 
                      ? 'text-white font-semibold' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className={`transition-colors duration-200 ${
                    pathname === '/pricing' 
                      ? 'text-white font-semibold' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Pricing
                </Link>
                <Link
                  href="/create-content"
                  className={`transition-colors duration-200 ${
                    pathname === '/create-content' 
                      ? 'text-white font-semibold' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Create Content
                </Link>
                <Link
                  href="/history"
                  className={`transition-colors duration-200 ${
                    pathname === '/history' 
                      ? 'text-white font-semibold' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  History
                </Link>
                <Link
                  href="/settings"
                  className={`transition-colors duration-200 ${
                    pathname === '/settings' 
                      ? 'text-white font-semibold' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Settings
                </Link>
                
                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 shadow-lg">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="text-xs font-medium text-white/60 mb-1">Current Plan</div>
                          <div className="text-sm font-semibold text-white">{tierInfo.display}</div>
                          <div className="text-xs text-white/40 mt-1">{tierInfo.jobsRemaining}</div>
                        </div>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Account Settings
                        </Link>
                        <Link
                          href="/pricing"
                          className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Billing & Plans
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth"
                  className="group relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:scale-105 transition duration-300">
                    Get Started Free
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white/80 hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-md rounded-lg border border-white/10 mt-2 mb-4">
            <div className="py-2">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-xs font-medium text-white/60 mb-1">Current Plan</div>
                    <div className="text-sm font-semibold text-white">{tierInfo.display}</div>
                    <div className="text-xs text-white/40 mt-1">{tierInfo.jobsRemaining}</div>
                  </div>
                  <Link
                    href="/dashboard"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      pathname === '/dashboard' 
                        ? 'text-white bg-white/10' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/pricing"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      pathname === '/pricing' 
                        ? 'text-white bg-white/10' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/create-content"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      pathname === '/create-content' 
                        ? 'text-white bg-white/10' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Content
                  </Link>
                  <Link
                    href="/history"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      pathname === '/history' 
                        ? 'text-white bg-white/10' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    History
                  </Link>
                  <Link
                    href="/settings"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      pathname === '/settings' 
                        ? 'text-white bg-white/10' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/pricing"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      pathname === '/billing' 
                        ? 'text-white bg-white/10' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Billing & Plans
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
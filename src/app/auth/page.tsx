'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await signIn({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          
          {/* Premium Logo Section */}
          <div className="text-center mb-12">
            <div className="group relative inline-block mb-8">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">CM</span>
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    ContentMux
                  </h1>
                  <p className="text-slate-300 text-sm font-medium">AI-Powered Content Platform</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-medium">AI APIs Active • Foundation Complete</span>
            </div>
          </div>

          {/* Main Authentication Card */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-10 rounded-xl">
              
              {/* Card Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {isLogin ? (
                    <>
                      Welcome <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Back</span>
                    </>
                  ) : (
                    <>
                      Create Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Account</span>
                    </>
                  )}
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  {isLogin 
                    ? 'Access your professional content workspace and continue transforming your strategy' 
                    : 'Join 1,000+ creators saving 15+ hours per week with AI-powered content automation'
                  }
                </p>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="group">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-200 mb-3">
                      <span className="flex items-center gap-2">
                        <span>👤</span>
                        Full Name
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-4 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                )}
                
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-3">
                    <span className="flex items-center gap-2">
                      <span>✉️</span>
                      Email Address
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-4 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-slate-400"
                      placeholder="your@company.com"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-3">
                    <span className="flex items-center gap-2">
                      <span>🔒</span>
                      Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-4 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 placeholder-slate-400"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {message && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-25"></div>
                    <div className={`relative p-4 rounded-xl border ${
                      message.includes('Check your email') 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {message.includes('Check your email') ? '📧' : '⚠️'}
                        </span>
                        <span className="font-medium">{message}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 group-disabled:opacity-50 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 transition-all duration-300">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing your request...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {isLogin ? (
                          <>
                            <span>🚀</span>
                            <span>Access Dashboard</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Create Professional Account</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </button>
              </form>

              {/* Switch Auth Mode */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="group text-slate-400 hover:text-white transition-colors font-medium"
                >
                  <span className="border-b border-transparent group-hover:border-white/30 transition-colors">
                    {isLogin 
                      ? "New to ContentMux? Create your professional account" 
                      : 'Already transforming content? Sign in to your account'
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Professional Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-6 font-medium">Trusted by content professionals worldwide</p>
            <div className="grid grid-cols-3 gap-4">
              
              {/* Security */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-lg text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">🔒</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-300 mb-1">Enterprise</div>
                  <div className="text-xs text-slate-400">Security</div>
                </div>
              </div>

              {/* Uptime */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-lg text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="text-xs font-semibold text-blue-300 mb-1">99.9%</div>
                  <div className="text-xs text-slate-400">Uptime</div>
                </div>
              </div>

              {/* AI Powered */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-lg text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div className="text-xs font-semibold text-purple-300 mb-1">AI</div>
                  <div className="text-xs text-slate-400">Powered</div>
                </div>
              </div>
            </div>

            {/* Additional Trust Elements */}
            <div className="mt-8 flex justify-center items-center gap-6 text-slate-500 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">✓</span>
                <span>3 free transformations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
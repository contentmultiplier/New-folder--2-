'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await signIn({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Premium Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-lg mb-4 border border-slate-600">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ContentMux</h1>
          <p className="text-slate-300 text-lg font-medium">AI-Powered Content Repurposing Platform</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="premium-card p-8">
          {/* Card Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-center text-slate-300 text-base leading-relaxed">
              {isLogin 
                ? 'Access your professional content library and continue transforming your content strategy' 
                : 'Join 1,000+ creators and agencies saving 15+ hours per week with AI-powered automation'
              }
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="premium-input w-full"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="premium-input w-full"
                placeholder="your@company.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="premium-input w-full"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {message && (
              <div className={`text-sm p-4 rounded-xl border ${
                message.includes('Check your email') 
                  ? 'bg-emerald-900/30 text-emerald-300 border-emerald-600/30' 
                  : 'bg-red-900/30 text-red-300 border-red-600/30'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="premium-button w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isLogin ? 'Sign In to Dashboard' : 'Create Professional Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium hover:underline"
            >
              {isLogin 
                ? "New to ContentMux? Create your account" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </div>

        {/* Professional Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 mb-4 font-medium">Trusted by content professionals worldwide</p>
          <div className="flex justify-center items-center space-x-8 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-900/30 rounded-full flex items-center justify-center border border-green-600/30">
                <span className="text-green-400 text-sm">🔒</span>
              </div>
              <span className="font-medium text-slate-300">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-600/30">
                <span className="text-blue-400 text-sm">⚡</span>
              </div>
              <span className="font-medium text-slate-300">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-600/30">
                <span className="text-purple-400 text-sm">🚀</span>
              </div>
              <span className="font-medium text-slate-300">AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@supabase/supabase-js';

export default function TestSessionPage() {
  const { user, session, getAccessToken } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const accessToken = await getAccessToken();
        
        setSessionInfo({
          hasSession: !!session,
          accessToken: accessToken ? 'Present' : 'Missing',
          accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'Missing',
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          authContextUser: user?.id,
          sessionFromContext: !!session,
        });
      } catch (error: any) {
        setSessionInfo({
          error: error.message
        });
      }
      setLoading(false);
    };

    checkSession();
  }, [user, session, getAccessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Session Debug Information</h1>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Auth Context</h2>
          <pre className="text-green-400 text-sm overflow-auto">
            {JSON.stringify({ user: user }, null, 2)}
          </pre>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Session Information</h2>
          <pre className="text-cyan-400 text-sm overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Environment Check</h2>
          <div className="text-white space-y-2">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a 
            href="/auth" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Auth
          </a>
          <a 
            href="/dashboard" 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Go to Dashboard
          </a>
          <a 
            href="/pricing" 
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            Go to Pricing
          </a>
        </div>
      </div>
    </div>
  );
}
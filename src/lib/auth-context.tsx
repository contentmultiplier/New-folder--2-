'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{ error: any }>;
  signUp: (credentials: { email: string; password: string; options?: any }) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session for token:', error);
        return null;
      }
      return session?.access_token || null;
    } catch (error) {
      console.error('Error in getAccessToken:', error);
      return null;
    }
  };

  const signIn = async (credentials: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (!error && data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (credentials: { email: string; password: string; options?: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp(credentials);
      
      if (!error && data.user) {
        setUser(data.user);
        setSession(data.session);
        
        // Create profile in database
        try {
          const profileData = {
            id: data.user.id,
            email: data.user.email,
            full_name: credentials.options?.data?.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail signup if profile creation fails
          } else {
            console.log('Profile created successfully for user:', data.user.id);
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail signup if profile creation fails
        }
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        // Get both user and session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Get session error:', error);
        }
        
        setUser(session?.user || null);
        setSession(session);
        setLoading(false);
      } catch (error) {
        console.error('Get initial session error:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user || null);
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      logout, 
      getAccessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
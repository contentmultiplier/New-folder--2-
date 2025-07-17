'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (data: { email: string; password: string; options?: any }) => Promise<any>
  signIn: (data: { email: string; password: string }) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
})

export const useAuth = () => {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (data: { email: string; password: string; options?: any }) => {
    const supabase = createClient()
    return supabase.auth.signUp(data)
  }

  const signIn = async (data: { email: string; password: string }) => {
    const supabase = createClient()
    return supabase.auth.signInWithPassword(data)
  }

  const signOut = async () => {
    const supabase = createClient()
    return supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
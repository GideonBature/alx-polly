
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowser } from '@/lib/supabase/browser'
import { Session, User } from '@supabase/supabase-js'

// React context for client-side session state; server components should prefer SSR via server client.
const AuthContext = createContext<{
  session: Session | null
  user: User | null
  signOut: () => void
}>({ session: null, user: null, signOut: () => {} })

/**
 * AuthProvider
 * What: Client-side provider that tracks Supabase auth session and user across route changes.
 * Why: Enables conditional client UI (e.g., header, buttons) without fetching on each component.
 * Server routes should still rely on server-side `createClient()` for secure data access.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createBrowser()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user ?? null)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => {
   // Clean up subscription to avoid memory leaks on unmount.
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

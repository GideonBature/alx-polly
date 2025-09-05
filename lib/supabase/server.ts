import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * createClient()
 * What: Constructs a Supabase server client wired to Next.js cookies for SSR/Server Actions.
 * Why: Ensures auth sessions persist securely via HttpOnly cookies and complies with Next.js 15's
 * dynamic API requirements (cookies() must be awaited). This centralizes server-side Supabase setup
 * and avoids duplicative, error-prone client creation across pages/actions.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

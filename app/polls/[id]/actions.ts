'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * vote(pollId, optionId)
 * What: Server Action that records a user's vote by calling the Postgres RPC `vote_once`.
 * Why: Using a server action with the server-side Supabase client ensures credentials are never exposed
 * to the browser, and the RPC enforces one-vote-per-user/token atomically under RLS.
 */
export async function vote(pollId: string, optionId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('vote_once', {
    p_poll_id: pollId,
    p_option_id: optionId,
    p_anon_token: null,
  })

  if (error) {
    console.error('Error voting:', error)
    throw error
  }

  revalidatePath(`/polls/${pollId}`)
}

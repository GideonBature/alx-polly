'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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

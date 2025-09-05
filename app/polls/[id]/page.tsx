import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { VoteForm } from "./vote-form"
import { Poll, Option } from "@/lib/types"

/**
 * PollPage
 * What: Server Component that fetches a single poll and its options via the Supabase SSR client.
 * Why: Server-side fetching respects RLS and hides DB interactions from the browser. The interactive
 * VoteForm is a client component to manage local state and user-driven voting.
 */
export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: poll, error } = await supabase
    .from('polls')
    .select('*, poll_options(*)')
    .eq('id', id)
    .single()

  if (error || !poll) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{poll.question}</h1>
  {/* Delegate voting UI/logic to a client component to keep SSR boundary clean. */}
  <VoteForm poll={poll as Poll & { poll_options: Option[] }} />
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { VoteForm } from "./vote-form"
import { Poll, Option } from "@/lib/types"

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
  <VoteForm poll={poll as Poll & { poll_options: Option[] }} />
    </div>
  )
}

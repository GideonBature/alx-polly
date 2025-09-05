'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Poll, Option } from "@/lib/types";
import { useState } from "react";
import { vote } from "./actions";

export function VoteForm({ poll }: { poll: Poll & { poll_options: Option[] } }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [options] = useState(poll.poll_options)
  const [submitting, setSubmitting] = useState(false)
  /**
   * VoteForm (Client Component)
   * What: Presents options and lets the user submit a single vote via the server action.
   * Why: Client interactivity (local state, click handlers) requires a client component. The actual
   * vote is submitted to a server action to avoid exposing credentials and to leverage DB-side RLS/RPC.
   */

  const handleVote = async () => {
    if (!selectedOption) return
    setVoted(true)
    // Optimistically mark as voted; server will still enforce single-vote invariant via RPC/RLS.
    setSubmitting(true)
    try {
      await vote(poll.id, selectedOption)
    } finally {
      setSubmitting(false)
    }
  }

  if (voted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{poll.question}</CardTitle>
          <CardDescription>Thank you for voting!</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Realtime updates could stream results; currently we suggest a brief delay for revalidation. */}
          <p className="text-sm text-foreground/70">Results will update shortly.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
        <CardDescription>Make your choice below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {options.map((option) => (
            <Button
              key={option.id}
              variant={selectedOption === option.id ? "default" : "outline"}
              className="justify-start"
              onClick={() => setSelectedOption(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
  {/* Disabled until an option is selected; server action also validates inputs. */}
  <Button onClick={handleVote} disabled={!selectedOption || submitting}>
          Vote
        </Button>
      </CardFooter>
    </Card>
  )
}

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

  const handleVote = async () => {
    if (!selectedOption) return
    setVoted(true)
    await vote(poll.id, selectedOption)
  }

  if (voted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{poll.question}</CardTitle>
          <CardDescription>Thank you for voting!</CardDescription>
        </CardHeader>
        <CardContent>
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
        <Button onClick={handleVote} disabled={!selectedOption}>
          Vote
        </Button>
      </CardFooter>
    </Card>
  )
}

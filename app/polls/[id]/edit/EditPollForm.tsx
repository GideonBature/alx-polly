'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { updatePoll } from '@/app/polls/[id]/edit/actions'

type Option = { id: string; label: string }

export default function EditPollForm({
  pollId,
  initialQuestion,
  initialOptions,
}: {
  pollId: string
  initialQuestion: string
  initialOptions: Option[]
}) {
  const [question, setQuestion] = useState(initialQuestion)
  const [options, setOptions] = useState<Option[]>(initialOptions)

  const addOption = () => setOptions((o) => [...o, { id: '', label: '' }])
  const updateOption = (i: number, v: string) =>
    setOptions((o) => o.map((x, idx) => (idx === i ? { ...x, label: v } : x)))
  const removeOption = (i: number) => setOptions((o) => o.filter((_, idx) => idx !== i))

  return (
    <Card>
      <form action={updatePoll}>
        <input type="hidden" name="pollId" value={pollId} />
        <CardHeader>
          <CardTitle>Edit poll</CardTitle>
          <CardDescription>Update the question or options.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                name="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label>Options</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="hidden" name={`optionIds`} value={opt.id} />
                  <Input
                    name={`optionLabels`}
                    placeholder={`Option ${i + 1}`}
                    value={opt.label}
                    onChange={(e) => updateOption(i, e.target.value)}
                  />
                  <Button type="button" variant="ghost" onClick={() => removeOption(i)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div>
                <Button type="button" variant="outline" onClick={addOption}>
                  Add option
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save changes</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

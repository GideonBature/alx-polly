"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPollPage() {
  const [options, setOptions] = useState<string[]>(["", ""]);

  const addOption = () => setOptions((o) => [...o, ""]);
  const updateOption = (i: number, v: string) => setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));

  return (
    <div className="mx-auto max-w-2xl w-full">
      <Card>
        <CardHeader>
          <CardTitle>Create a poll</CardTitle>
          <CardDescription>Write a question and add options.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Textarea id="question" placeholder="What should we vote on?" />
            </div>
            <div className="grid gap-3">
              <Label>Options</Label>
              {options.map((opt, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                />
              ))}
              <div>
                <Button type="button" variant="outline" onClick={addOption}>
                  Add option
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button>Create poll</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

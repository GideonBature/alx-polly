import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mock = {
  "1": {
    id: "1",
    question: "Best JS framework in 2025?",
    options: ["Next.js", "SvelteKit", "Nuxt", "Remix"],
  },
  "2": { id: "2", question: "Tabs or spaces?", options: ["Tabs", "Spaces"] },
} as const;

export default async function PollDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = mock[id as keyof typeof mock];
  if (!poll) return notFound();
  return (
    <div className="mx-auto max-w-2xl w-full">
      <Card>
        <CardHeader>
          <CardTitle>{poll.question}</CardTitle>
          <CardDescription>Make your choice below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {poll.options.map((opt) => (
              <Button key={opt} variant="outline" className="justify-start">
                {opt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

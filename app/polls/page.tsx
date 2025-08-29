import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockPolls = [
  { id: "1", question: "Best JS framework in 2025?", options: 4, votes: 128 },
  { id: "2", question: "Tabs or spaces?", options: 2, votes: 256 },
];

export default function PollsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Polls</h1>
        <p className="text-foreground/70">Browse and vote on community polls.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {mockPolls.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{poll.question}</CardTitle>
                <CardDescription>
                  {poll.options} options · {poll.votes} votes
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deletePoll } from "./actions";

export default async function PollsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = (await (searchParams ?? Promise.resolve({}))) as Record<string, string | string[] | undefined>
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth?.user?.id

  const { data: polls, error } = await supabase
    .from('polls')
    .select('id, question, owner, created_at, poll_options(id, label)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching polls:', error)
    return <p>Error fetching polls</p>
  }

  return (
    <div className="space-y-6">
      {sp.created === '1' && (
        <div className="rounded-md border border-black/10 dark:border-white/15 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200 px-4 py-3">
          /**
           * PollsPage
           * What: Server Component that lists polls visible to the current user and provides owner-only controls.
           * Why: Central dashboard for discovery and management; SSR ensures fast loads and secure data fetching
           * via the Supabase server client and RLS. We compute `isOwner` strictly on the server to avoid exposing
           * sensitive checks to the client and to prevent UI desync for unauthorized users.
           */
          Poll created successfully
        </div>
      )}
      {sp.updated === '1' && (
        <div className="rounded-md border border-black/10 dark:border-white/15 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200 px-4 py-3">
          Poll updated successfully
        </div>
      )}
      {sp.deleted === '1' && (
        <div className="rounded-md border border-black/10 dark:border-white/15 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200 px-4 py-3">
          Poll deleted successfully
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold">Polls</h1>
        <p className="text-foreground/70">Browse and vote on community polls.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(polls as any[]).map((poll) => {
          const isOwner = userId && poll.owner === userId
          return (
            <Card key={poll.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  <Link href={`/polls/${poll.id}`}>{poll.question}</Link>
                </CardTitle>
                <CardDescription>{poll.poll_options?.length ?? 0} options</CardDescription>
              </CardHeader>
              {isOwner && (
                <CardFooter className="pt-0">
                  <div className="flex gap-2">
                    <Link
                      href={`/polls/${poll.id}/edit`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Edit
                    </Link>
                    <form action={deletePoll}>
                      <input type="hidden" name="pollId" value={poll.id} />
                      <Button type="submit" variant="ghost">Delete</Button>
                    </form>
                  </div>
                </CardFooter>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

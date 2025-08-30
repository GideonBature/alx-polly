import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryCtaHref = "/polls";
  const secondaryCtaHref = user ? "/polls/new" : "/auth/sign-in";
  const secondaryCtaLabel = user ? "Create a poll" : "Sign in to create";

  return (
    <div className="mx-auto max-w-5xl w-full py-12 sm:py-16">
      <section className="text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Simple polling for fast decisions</h1>
        <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto">
          Browse and vote on existing polls instantly. To create your own polls and share them with others,
          please sign in or create an account.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href={primaryCtaHref}>
            <Button>Browse polls</Button>
          </Link>
          <Link href={secondaryCtaHref}>
            <Button variant="outline">{secondaryCtaLabel}</Button>
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>1. Discover</CardTitle>
            <CardDescription>Anyone can view and vote on public polls.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            Explore trending and recent polls, then cast your vote with one click.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Decide</CardTitle>
            <CardDescription>See results update as votes come in.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            Each poll aggregates votes in real time so groups can make quick decisions.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Create</CardTitle>
            <CardDescription>Requires an account to manage your polls.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            Sign in to create, edit, and share your own polls via link or QR code.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

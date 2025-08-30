'use client'

import Link from "next/link";
import { useAuth } from "@/app/auth/context";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto max-w-6xl w-full px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">Polly</Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/polls"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
          >
            Polls
          </Link>
          {user ? (
            <>
              <Link
                href="/polls/new"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 bg-foreground text-background hover:opacity-90"
              >
                New Poll
              </Link>
              <Button
                variant="ghost"
                onClick={signOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 border border-black/10 dark:border-white/20 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { createBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

/**
 * SignInPage (Client Component)
 * What: Simple email/password sign-in using Supabase client.
 * Why: Runs on the client to avoid a full round-trip; session is stored in secure cookies by Supabase
 * and is then available to server components via the SSR client.
 */
export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
  // After sign-in, send to the homepage where SSR can tailor CTAs.
  router.push('/');
    }
  };

  return (
    <div className="mx-auto max-w-md w-full">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your polls and voting history.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSignIn}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="mt-4 text-sm text-foreground/70">
            New here? <Link className="underline" href="/auth/sign-up">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

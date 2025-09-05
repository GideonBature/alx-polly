## Polling App with QR Code Sharing

Create, share, and vote on polls. Built with Next.js App Router and Supabase (Auth + Postgres with RLS) and styled with Tailwind + shadcn/ui.

### Tech Stack
- Next.js (App Router, Server Components, Server Actions)
- TypeScript
- Supabase (Auth, Postgres, RLS, RPC)
- Tailwind CSS + shadcn/ui components

## Project Structure
- `app/` routes (server-first):
	- `app/page.tsx`: Landing page with CTAs
	- `app/polls/`: List of polls; owner-only edit/delete
	- `app/polls/new`: Create poll (Server Action)
	- `app/polls/[id]`: Poll detail and voting
	- `app/polls/[id]/edit`: Edit poll (owner only)
- `lib/`:
	- `lib/supabase/server.ts`: Supabase SSR client (awaits `cookies()` per Next 15)
	- `lib/supabase/browser.ts`: Supabase browser client for client components
	- `lib/types.ts`: Shared types for Poll, Option
- `components/ui/`: shadcn/ui primitives
- `supabase/migrations/0001_init.sql`: Schema, RLS policies, and `vote_once` RPC

## Setup
1) Clone and install dependencies
```bash
npm install
```

2) Supabase project
- Create a Supabase project (https://supabase.com)
- Retrieve:
	- NEXT_PUBLIC_SUPABASE_URL
	- NEXT_PUBLIC_SUPABASE_ANON_KEY
	- SUPABASE_SERVICE_ROLE (if running admin scripts; not required for this app)

3) Environment variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4) Database schema
- Apply the SQL in `supabase/migrations/0001_init.sql` to your database (via Supabase SQL editor or CLI). It creates:
	- Tables: `profiles`, `polls`, `poll_options`, `votes`
	- RLS policies (owner-only writes, public read for open polls)
	- RPC: `vote_once` to enforce single vote per user/token

## Running locally
```bash
npm run dev
```
Open http://localhost:3000

## Usage
### Create a poll
1. Sign in (top-right) or go to `/auth/sign-in`
2. Visit `/polls/new`
3. Enter a question and 2–10 options; submit
4. You’ll be redirected to `/polls` with a success banner

### Edit/Delete a poll
- From `/polls`, click Edit on your poll; update question/options and save
- Delete uses a server action with owner checks and RLS

### Vote on a poll
- Open a poll from `/polls`
- Select an option and click Vote
- Votes are recorded via the `vote_once` RPC with RLS

## Testing and verification
- TypeScript builds on save; fix any TS errors reported by the editor
- Quick smoke tests:
	- Sign up/in and confirm `/polls/new` is accessible
	- Create a poll; verify it appears on `/polls`
	- Edit and delete as the owner; ensure banners show
	- Vote on the poll; confirm no duplicate votes as the same user

## Notes
- Server Components fetch data via Supabase SSR client; mutations use Server Actions
- Secrets are read from environment variables; never hardcode keys
- RLS is the primary authorization layer; app code includes owner checks for defense in depth

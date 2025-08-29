This is a Next.js polling app scaffolded for upcoming features (auth, viewing polls, creating polls).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## App structure

- UI primitives (shadcn-style): `components/ui/{button,input,label,card,textarea}.tsx`
- Shared utils: `lib/utils.ts` (cn helper)
- Navigation: `components/navbar.tsx` wired in `app/layout.tsx`
- Routes:
	- Auth: `app/auth/sign-in`, `app/auth/sign-up`
	- Polls: `app/polls` (list), `app/polls/[id]` (detail), `app/polls/new` (create)

All pages are placeholders using the UI primitives, ready to be wired to real data and auth.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses `next/font` to load Geist fonts.

## Learn More

To learn more, see Next.js docs: https://nextjs.org/docs

## Deploy on Vercel

Deploy easily on Vercel: https://vercel.com/new

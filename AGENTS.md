# AGENTS.md — Fanilo Event QR Code Scanner

## Commands
- `npm run dev` — Start dev server with Turbopack
- `npm run dev:https` — Dev server with HTTPS (required for camera access)
- `npm run build` — Runs `prisma generate` then `next build`
- `npm run lint` — Next.js ESLint (core-web-vitals + typescript)
- No test script yet; tests can be added with Vitest or Jest

## Prisma
- After schema changes: `npx prisma migrate dev`
- Generate client: `npx prisma generate` (already runs in build)
- View data: `npx prisma studio`

## Environment
- PostgreSQL required; set `DATABASE_URL` in `.env`
- NextAuth may need `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (providers not yet configured)
- `.env` is gitignored

## Architecture
- Next.js 15 App Router with route groups:
  - `(auth)` — Login page
  - `(root)` — Main scanner interface
- API routes: `/api/scanner` (POST), `/api/history`, `/api/stats`, `/api/auth`
- UI: shadcn/ui (`new-york` style) + Tailwind CSS4 + lucide icons
- Prisma schema: `Billet`, `Scan`, `User` models
- Auth: NextAuth v4 (currently empty providers)

## Conventions
- UI text is in French
- TypeScript strict mode, path alias `@/*` → `./src/*`
- ESLint: `next/core-web-vitals` + `next/typescript`
- No tests yet

## Gotchas
- Camera access requires HTTPS in production; use `npm run dev:https` locally
- Prisma client generated to `src/generated/prisma` (gitignored)
- QR scanning uses `html5-qrcode` library
- Auth providers need configuration before login works
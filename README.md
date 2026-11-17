# Fanilo Event QR Code Scanner

Ticket scanner used at the entrance of the Fanilo Festival in Antananarivo to validate real tickets.

Live: <https://faniloticket.vercel.app>

## Features

- Scan a ticket QR code with the phone camera
- Ticket types (1, 3 and 5-day passes) with a scan limit per ticket, so a shared ticket stops working
- Role-based access (NextAuth)
- Live statistics by ticket category
- Scan history, filterable by date range and search

## Stack

Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui, PostgreSQL with Prisma, NextAuth, html5-qrcode, React Hook Form and Zod. Deployed on Vercel.

## Run

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```bash
npx prisma migrate dev
npm run dev:https   # the camera needs HTTPS
```

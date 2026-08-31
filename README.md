# 🎫 Fanilo Event QR Code Scanner

A production-ready mobile QR code scanning application built for real-world event ticketing. Originally developed for the **Fanilo Festival** in Antananarivo, Madagascar, where it was used to manage ticket validation and entry tracking for a live event.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://faniloticket.vercel.app)

> **Real-world use case:** This wasn't just a side project — it was deployed and used at an actual festival to handle real ticket scanning at the entrance, managing multiple ticket categories (1-day, 3-day, 5-day passes) with scan limits to prevent ticket sharing.

## ✨ Features

- **📱 Mobile-First QR Scanner** — Real-time QR code scanning using device camera
- **🔒 Secure Authentication** — Role-based access control with NextAuth
- **📊 Live Analytics** — Real-time statistics on ticket scans by category
- **📋 Scan History** — Filterable log of all scans with date range and search
- **🎫 Ticket Management** — Support for multiple ticket types with scan limits
- **🎨 Modern UI** — Beautiful dark theme with smooth animations

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router + Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Auth** | [NextAuth.js v4](https://next-auth.js.org/) |
| **QR Scanning** | [html5-qrcode](https://github.com/mebjas/html5-qrcode) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TsioryJonathan/fanilo-event-qr-code-scanner.git
   cd fanilo-event-qr-code-scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database URL:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/fanilo_event"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

> **Note:** For camera access, you'll need HTTPS. Use `npm run dev:https` for local HTTPS development.

## 📁 Project Structure

```
fanilo-event-qr-code-scanner/
├── prisma/
│   ├── migrations/        # Database migrations
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/        # Authentication routes
│   │   │   └── login/     # Login page
│   │   ├── (root)/        # Main app routes
│   │   ├── api/           # API endpoints
│   │   │   ├── scanner/   # QR scan handler
│   │   │   ├── history/   # Scan history
│   │   │   └── stats/     # Analytics
│   │   ├── historique/    # History page
│   │   └── stats/         # Stats page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Scanner.tsx    # QR scanner component
│   │   └── Stat.tsx       # Statistics display
│   └── lib/
│       ├── prisma.ts      # Prisma client
│       ├── utils.ts       # Utility functions
│       └── zod.ts         # Validation schemas
├── auth.ts                # NextAuth configuration
└── package.json
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | ✅ |
| `NEXTAUTH_URL` | Base URL for auth callbacks | ✅ |

## 📱 Key Features in Detail

### QR Scanner
- Real-time camera feed with overlay guidance
- Automatic ticket validation and scan limit enforcement
- Graceful handling of camera permissions and errors
- Support for multiple ticket types (1-day, 3-day, 5-day passes)

### Authentication
- Secure email/password authentication
- Protected routes with automatic redirects
- Session management with NextAuth.js

### Analytics Dashboard
- Real-time scan statistics by ticket category
- Filterable scan history with date ranges
- Search functionality for specific ticket numbers

## 🎨 Design System

Built with **shadcn/ui** components featuring:
- Custom dark theme optimized for event environments
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Accessible form controls with validation feedback

## 🚢 Deployment

This project is optimized for **Vercel** deployment:

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TsioryJonathan/fanilo-event-qr-code-scanner)

## 📄 License

This project is open source under the MIT License — feel free to use it as a reference or starting point for your own event ticketing system.

> **Note:** This was built specifically for the Fanilo Festival in Antananarivo, Madagascar. While the code is freely available, it was designed to solve a real, time-sensitive problem — not as a generic SaaS product.

---

<div align="center">

**Built with ❤️ for the Fanilo Festival**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

</div>
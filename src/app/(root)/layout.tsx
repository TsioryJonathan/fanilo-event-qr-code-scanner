import type React from "react";
import "../globals.css";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FloatingSidebar from "@/components/FloatingNavbar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Providers } from "../providers";
import UserButton from "@/components/UserButton";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Event QR Scanner",
  description: "Scan QR codes for event check-in and verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${quicksand.className} max-h-screen max-screen flex justify-center mt-10 dark overflow-hidden`}
      >
        <Providers>
          <UserButton />
          <BackgroundBeams className="-z-10" />
          <FloatingSidebar />
          <main>{children}</main>
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

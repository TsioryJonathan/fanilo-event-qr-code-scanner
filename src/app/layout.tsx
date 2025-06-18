import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FloatingSidebar from "@/components/FloatingSidebar";
import { BackgroundBeams } from "@/components/ui/background-beams";

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
        className={`${quicksand.className} min-h-screen min-w-screen flex items-center justify-center dark`}
      >
        <BackgroundBeams className="-z-10" />
        <FloatingSidebar />
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}

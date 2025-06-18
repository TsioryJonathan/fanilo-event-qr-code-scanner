import type React from "react";
import "../globals.css";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        className={`${quicksand.className} h-screen w-screen flex justify-center items-center dark overflow-hidden bg-background`}
      >
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}

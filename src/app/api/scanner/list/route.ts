// API route to get list of scanned tickets
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Définir un type explicite pour le ticket avec scans
interface TicketWithScans {
  id: number;
  type: string;
  categorie: string;
  scan_limit: number;
  scans_used: number;
  numero: string;
  image_path: string;
  scans: { createdAt: Date }[];
}

export async function GET() {
  try {
    // Fetch all tickets ordered by number of scans
    const tickets = await prisma.billet.findMany({
      select: {
        id: true,
        type: true,
        categorie: true,
        scan_limit: true,
        scans_used: true,
        numero: true,
        image_path: true,
        scans: {
          select: { createdAt: true },
        },
      },
      orderBy: {
        scans_used: "desc",
      },
    }) as TicketWithScans[];

    return NextResponse.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        ...ticket,
        scans: ticket.scans.map((scan) => scan.createdAt.toISOString()),
      })),
    });
  } catch (error) {
    console.error("Error fetching scanned tickets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
    });

    return NextResponse.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        ...ticket,
        scans: ticket.scans.map((scan) => scan.createdAt.toISOString()),
      })),
    });
  } catch (error) {
    console.error("Error fetching scanned tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

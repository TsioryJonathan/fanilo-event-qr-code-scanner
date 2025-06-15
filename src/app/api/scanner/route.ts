// API route to handle ticket scanning
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Définir un type explicite pour le ticket avec scans
interface TicketWithScans {
  id: number;
  type: string;
  scan_limit: number;
  scans_used: number;
  numero: string;
  scans: { createdAt: Date }[];
}

export async function POST(request: Request) {
  try {
    // Get the QR code from the request body
    const { code } = await request.json();

    console.log(code);

    if (!code) {
      return NextResponse.json(
        { error: "QR code is required" },
        { status: 400 }
      );
    }

    // Fetch the ticket from the database with scans
    const ticket = (await prisma.billet.findUnique({
      where: { code },
      select: {
        id: true,
        type: true,
        scan_limit: true,
        scans_used: true,
        numero: true,
        scans: {
          select: { createdAt: true },
        },
      },
    })) as TicketWithScans | null;

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Calculate remaining scans
    const remainingScans = ticket.scan_limit - ticket.scans_used;

    // Check if scan limit is reached
    if (remainingScans <= 0) {
      return NextResponse.json(
        {
          error: "Ticket has reached its maximum scan limit",
          details: {
            type: ticket.type,
            numero: ticket.numero,
            scan_limit: ticket.scan_limit,
            scans_used: ticket.scans_used,
            scans: ticket.scans.map((scan) => scan.createdAt.toISOString()),
          },
        },
        { status: 403 }
      );
    }

    // Update scan count and record scan in a transaction
    const updatedTicket = (await prisma.$transaction(async (tx) => {
      await tx.billet.update({
        where: { id: ticket.id },
        data: {
          scans_used: ticket.scans_used + 1,
        },
      });

      await tx.scan.create({
        data: {
          billetId: ticket.id,
        },
      });

      // Fetch updated ticket with scans
      return await tx.billet.findUnique({
        where: { id: ticket.id },
        select: {
          id: true,
          type: true,
          scan_limit: true,
          scans_used: true,
          numero: true,
          scans: {
            select: { createdAt: true },
          },
        },
      });
    })) as TicketWithScans | null;

    // Check if updatedTicket is null
    if (!updatedTicket) {
      return NextResponse.json(
        { error: "Failed to update ticket" },
        { status: 500 }
      );
    }

    // Calculate new remaining scans
    const newRemainingScans =
      updatedTicket.scan_limit - updatedTicket.scans_used;

    // Generate appropriate message based on remaining scans
    let message = "";
    if (newRemainingScans === 0) {
      message = "Last scan allowed! This ticket cannot be scanned anymore.";
    } else if (newRemainingScans === 1) {
      message = "1 scan remaining! Use it carefully.";
    } else {
      message = `${newRemainingScans} scans remaining.`;
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: updatedTicket.id,
        type: updatedTicket.type,
        scan_limit: updatedTicket.scan_limit,
        scans_used: updatedTicket.scans_used,
        numero: updatedTicket.numero,
        scans: updatedTicket.scans.map((scan) => scan.createdAt.toISOString()),
      },
      message,
      remainingScans: newRemainingScans,
    });
  } catch (error) {
    console.error("Error scanning ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

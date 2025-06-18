// API route pour gérer le scan des billets
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type explicite pour le billet avec scans
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
    // Récupère le QR code depuis le body
    const { code } = await request.json();

    console.log(code);

    if (!code) {
      return NextResponse.json(
        { error: "Le QR code est requis" },
        { status: 400 }
      );
    }

    // Cherche le billet dans la base avec ses scans
    const ticket = (await prisma.billet.findUnique({
      where: { code },
      select: {
        id: true,
        type: true,
        scan_limit: true,
        scans_used: true,
        numero: true,
        scans: { select: { createdAt: true } },
      },
    })) as TicketWithScans | null;

    if (!ticket) {
      return NextResponse.json(
        { error: "Billet introuvable" },
        { status: 404 }
      );
    }

    const remainingScans = ticket.scan_limit - ticket.scans_used;

    // Limite atteinte ?
    if (remainingScans <= 0) {
      return NextResponse.json(
        {
          error: "Ce billet a atteint sa limite maximale de scans",
          details: {
            type: ticket.type,
            numero: ticket.numero,
            scan_limit: ticket.scan_limit,
            scans_used: ticket.scans_used,
            scans: ticket.scans.map((s) => s.createdAt.toISOString()),
          },
        },
        { status: 403 }
      );
    }

    // Met à jour le compteur et enregistre le scan
    const updatedTicket = (await prisma.$transaction(async (tx) => {
      await tx.billet.update({
        where: { id: ticket.id },
        data: { scans_used: ticket.scans_used + 1 },
      });

      await tx.scan.create({ data: { billetId: ticket.id } });

      return await tx.billet.findUnique({
        where: { id: ticket.id },
        select: {
          id: true,
          type: true,
          scan_limit: true,
          scans_used: true,
          numero: true,
          scans: { select: { createdAt: true } },
        },
      });
    })) as TicketWithScans | null;

    if (!updatedTicket) {
      return NextResponse.json(
        { error: "Échec de la mise à jour du billet" },
        { status: 500 }
      );
    }

    const newRemaining = updatedTicket.scan_limit - updatedTicket.scans_used;

    // Message utilisateur
    let message = "";
    if (newRemaining === 0) {
      message = "Dernier scan autorisé ! Ce billet ne peut plus être scanné.";
    } else if (newRemaining === 1) {
      message = "Il reste 1 scan ! Utilisez-le avec précaution.";
    } else {
      message = `Il reste ${newRemaining} scans.`;
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: updatedTicket.id,
        type: updatedTicket.type,
        scan_limit: updatedTicket.scan_limit,
        scans_used: updatedTicket.scans_used,
        numero: updatedTicket.numero,
        scans: updatedTicket.scans.map((s) => s.createdAt.toISOString()),
      },
      message,
      remainingScans: newRemaining,
    });
  } catch (error) {
    console.error("Erreur lors du scan du billet :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

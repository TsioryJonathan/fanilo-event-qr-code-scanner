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
    const { code } = await request.json();

    console.log("Code reçu:", code);

    if (!code) {
      return NextResponse.json({ error: "Le QR code est requis" }, { status: 400 });
    }

    let ticket: TicketWithScans | null = null;
    try {
      ticket = (await prisma.billet.findUnique({
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
    } catch (error) {
      console.error("Erreur lors de la recherche du billet:", error);
      const failedScan = await prisma.scan.create({
        data: { billetId: null as any, status: "failed" },
      });
      console.log("Erreur recherche, scan failed enregistré:", failedScan);
      return NextResponse.json({ error: "Erreur lors de la recherche du billet" }, { status: 500 });
    }

    if (!ticket) {
      // Enregistrer un scan failed pour un billet introuvable
      const failedScan = await prisma.scan.create({
        data: { billetId: null as any, status: "failed" },
      });
      console.log("Billet introuvable, scan failed enregistré:", failedScan);
      return NextResponse.json({ error: "Billet introuvable" }, { status: 404 });
    }

    const remainingScans = ticket.scan_limit - ticket.scans_used;

    // Limite atteinte ?
    if (remainingScans <= 0) {
      // Enregistrer un scan failed pour limite atteinte
      const failedScan = await prisma.scan.create({ data: { billetId: ticket.id, status: "failed" } });
      console.log("Limite atteinte, scan failed enregistré:", failedScan);
      return NextResponse.json(
        {
          error: "Ce billet a atteint sa limite de scans",
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
      console.log("Mise à jour du billet:", ticket.id);
      await tx.billet.update({
        where: { id: ticket.id },
        data: { scans_used: ticket.scans_used + 1 },
      });

      const newScan = await tx.scan.create({ data: { billetId: ticket.id, status: "success" } }).catch((e) => {
        console.error("Erreur création scan:", e);
        throw e;
      });
      console.log("Nouveau scan créé:", newScan);

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
      return NextResponse.json({ error: "Échec de la mise à jour du billet" }, { status: 500 });
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
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
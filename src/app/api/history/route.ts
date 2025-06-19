import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/history
// Retourne la liste des scans les plus récents (100 derniers)
export async function GET(request: Request) {
  // Vérifie la session pour sécuriser la route
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
        // Parse query params
    const url = new URL(request.url);
    const start = url.searchParams.get("start"); // yyyy-mm-dd
    const end = url.searchParams.get("end");
    const q = url.searchParams.get("q");

    const where: any = {};
    if (start) where.createdAt = { gte: new Date(start) };
    if (end) {
      where.createdAt = {
        ...(where.createdAt ?? {}),
        lte: new Date(end + "T23:59:59")
      };
    }
    if (q) {
      where.billet = {
        numero: {
          contains: q,
          mode: "insensitive",
        },
      };
    }

    const scans = await prisma.scan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        billet: {
          select: {
            numero: true,
            type: true,
          },
        },
      },
    });

    const results = scans.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      numero: s.billet?.numero ?? "N/A",
      type: s.billet?.type ?? "N/A",
    }));

    return NextResponse.json({ scans: results });
  } catch (error) {
    console.error("Erreur récupération historique", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

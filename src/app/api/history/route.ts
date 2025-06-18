import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

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

    const where: Prisma.ScanWhereInput = {};

    // Validation des dates
    function isValidDate(dateString: string | null): boolean {
      if (!dateString) return false;
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(dateString)) return false;
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    }

    if (start || end) {
      where.createdAt = {};
      if (start) {
        if (!isValidDate(start)) {
          return NextResponse.json({ error: "Date de début invalide" }, { status: 400 });
        }
        where.createdAt.gte = new Date(start);
      }
      if (end) {
        if (!isValidDate(end)) {
          return NextResponse.json({ error: "Date de fin invalide" }, { status: 400 });
        }
        where.createdAt.lte = new Date(`${end}T23:59:59.999Z`);
      }
    }

    if (q && typeof q === "string" && q.trim().length > 0) {
      where.billet = {
        numero: {
          contains: q.trim(),
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
      createdAt: s.createdAt.toISOString(), // Sérialisation pour JSON
      numero: s.billet.numero,
      type: s.billet.type,
    }));

    return NextResponse.json({ scans: results });
  } catch (error) {
    console.error("Erreur récupération historique", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Erreur base de données: ${error.message}` },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
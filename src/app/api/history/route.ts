import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import auth from "next-auth";

interface ScanResult {
  id: number;
  createdAt: string | null;
  numero: string;
  type: string;
  status: string;
  scanLimit: number;
  scansUsed: number;
}

type ScanWithBillet = Prisma.ScanGetPayload<{
  include: {
    billet: {
      select: { numero: true; type: true; scan_limit: true; scans_used: true };
    };
  };
}> & { status: string };

export async function GET(request: Request) {
  const session = await auth;
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    console.log("Requête reçue pour /api/history:", request.url);
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    const q = url.searchParams.get("q");
    console.log("Paramètres reçus:", { start, end, q });

    const where: Prisma.ScanWhereInput = {};

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
          console.log("Date de début invalide:", start);
          return NextResponse.json(
            { error: "Date de début invalide" },
            { status: 400 }
          );
        }
        where.createdAt.gte = new Date(start);
      }
      if (end) {
        if (!isValidDate(end)) {
          console.log("Date de fin invalide:", end);
          return NextResponse.json(
            { error: "Date de fin invalide" },
            { status: 400 }
          );
        }
        where.createdAt.lte = new Date(`${end}T23:59:59.999Z`);
      }
      if (start && end && new Date(start) > new Date(end)) {
        console.log("Erreur de validation: start > end", { start, end });
        return NextResponse.json(
          { error: "La date de début doit être antérieure à la date de fin" },
          { status: 400 }
        );
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

    console.log("Exécution de la requête Prisma avec where:", where);
    const scans = await prisma.scan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        billet: {
          select: {
            numero: true,
            type: true,
            scan_limit: true,
            scans_used: true,
          },
        },
      },
    });

    console.log("Scans récupérés:", scans);
    const results: ScanResult[] = scans.map((s: ScanWithBillet) => {
      console.log("Scan item:", s);
      return {
        id: s.id,
        createdAt: s.createdAt ? s.createdAt.toISOString() : null,
        numero: s.billet?.numero || "Inconnu",
        type: s.billet?.type || "Inconnu",
        status: s.status,
        scanLimit: s.billet?.scan_limit || 5,
        scansUsed: s.billet?.scans_used || 0,
      };
    });

    return NextResponse.json({ scans: results });
  } catch (error) {
    let errorMessage = "Erreur serveur interne";
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        message: error.message,
        stack: error.stack,
      };
    } else if (error instanceof Object) {
      errorDetails = { error: JSON.stringify(error) };
    }

    console.error("Erreur récupération historique:", errorDetails);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Erreur base de données: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    console.log("Requête /api/history terminée");
  }
}

// /app/api/stats/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await prisma.$queryRaw<{ type: string; total: bigint }[]>`
      SELECT b."type", COUNT(DISTINCT s."billetId") AS total
      FROM "Scan" s
      JOIN "Billet" b ON s."billetId" = b."id"
      GROUP BY b."type";
    `;

    const parsedStats = stats.map(({ type, total }) => ({
      type,
      total: Number(total),
    }));

    return NextResponse.json(parsedStats, { status: 200 });
  } catch (error) {
    console.error("Erreur stats billets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Clock, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { format, isAfter } from "date-fns";
import { debounce } from "lodash";

interface ScanItem {
  id: number;
  createdAt: string;
  numero: string;
  type: string;
}

function Filters({
  onApply,
}: {
  onApply: (p: { start?: string; end?: string; q?: string }) => void;
}) {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (start && end) {
      // Utilisation de isAfter de date-fns
      if (isAfter(new Date(start), new Date(end))) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description:
            "La date de début ne peut pas être postérieure à la date de fin.",
        });
        return;
      }
      // Alternative sans date-fns :
      // if (new Date(start) > new Date(end)) {
      //   toast({
      //     variant: "destructive",
      //     title: "Erreur",
      //     description: "La date de début ne peut pas être postérieure à la date de fin.",
      //   });
      //   return;
      // }
    }
    onApply({ start, end, q });
  };

  return (
    <form
      className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6 p-2 bg-green-900/10 rounded-lg shadow-md"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1 w-full md:flex-1">
        <Label htmlFor="start" className="text-white/80 font-medium text-sm">
          Début
        </Label>
        <Input
          id="start"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          aria-label="Sélectionnez la date de début du filtre"
          className="w-full bg-gray-800/40 border border-green-700/50 rounded-lg text-white/90 placeholder-gray-500 focus:ring-2 focus:ring-orange-400 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col gap-1 w-full md:flex-1">
        <Label htmlFor="end" className="text-white/80 font-medium text-sm">
          Fin
        </Label>
        <Input
          id="end"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          aria-label="Sélectionnez la date de fin du filtre"
          className="w-full bg-gray-800/40 border border-green-700/50 rounded-lg text-white/90 placeholder-gray-500 focus:ring-2 focus:ring-orange-400 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col gap-1 w-full md:flex-1">
        <Label htmlFor="search" className="text-white/80 font-medium text-sm">
          Numéro de billet
        </Label>
        <Input
          id="search"
          placeholder="Rechercher..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Rechercher par numéro de billet"
          className="w-full bg-gray-800/40 border border-green-700/50 rounded-lg text-white/90 placeholder-gray-500 focus:ring-2 focus:ring-orange-400 transition-all duration-200"
        />
      </div>
      <Button
        type="submit"
        className="w-full md:w-auto flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 transition-all duration-200"
      >
        <Search className="w-4 h-4" />
        Filtrer
      </Button>
    </form>
  );
}

function HistoryContent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScanItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(
      async (params: { start?: string; end?: string; q?: string } = {}) => {
        setLoading(true);
        try {
          const query = new URLSearchParams();
          if (params.start) query.append("start", params.start);
          if (params.end) query.append("end", params.end);
          if (params.q) query.append("q", params.q);
          const queryString = query.toString();
          const res = await fetch(
            `/api/history${queryString ? `?${queryString}` : ""}`
          );
          const json = await res.json();
          if (!res.ok) {
            if (res.status === 401) {
              router.push("/login");
              return;
            }
            throw new Error(json.error || "Erreur");
          }
          setData(json.scans);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Une erreur inconnue s'est produite";
          console.error("Erreur fetching data:", err);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: errorMessage,
          });
        } finally {
          setLoading(false);
        }
      },
      300
    ),
    [router, toast]
  );

  useEffect(() => {
    fetchData(); // Initial fetch
    // Dépendances intentionnellement limitées au montage initial
  }, [fetchData]);

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      return format(date, "dd/MM/yyyy HH:mm");
    } catch {
      return "Erreur de format";
    }
  };

  return (
    <div className="w-full md:w-[700px] mx-auto px-4">
      <Filters onApply={fetchData} />

      {loading ? (
        <div className="flex justify-center pt-20">
          <Loader2 className="animate-spin w-10 h-10 text-yellow-400 transition-transform duration-300" />
        </div>
      ) : (
        <Card className="border-2 border-green-800/50 bg-gray-900/60 mt-6 rounded-xl shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white/90 font-semibold">
              Historique des scans
            </CardTitle>
            <CardDescription className="text-yellow-300">
              Total : {data.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <p className="text-center text-gray-500">Aucun scan trouvé.</p>
            ) : (
              <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {data.map((scan) => (
                  <li
                    key={scan.id}
                    className="flex items-center justify-between bg-green-900/30 p-4 rounded-xl shadow-md hover:bg-green-800/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-300" />
                      <div>
                        <p className="font-medium text-white">
                          Billet {scan.numero}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(scan.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm px-2 py-1 rounded-full transition-colors duration-200 ${
                        scan.type === "Pass 1 jour"
                          ? "bg-blue-400/20 text-blue-400"
                          : scan.type === "Pass 3 jours"
                          ? "bg-green-400/20 text-green-400"
                          : scan.type === "Pass 5 jours"
                          ? "bg-yellow-400/20 text-yellow-400"
                          : scan.type === "Offre Excellence"
                          ? "bg-orange-400/20 text-orange-400"
                          : scan.type === "Offre Prestige"
                          ? "bg-purple-400/20 text-purple-400"
                          : scan.type === "Offre Lumière"
                          ? "bg-red-400/20 text-red-400"
                          : "bg-gray-400/20 text-gray-400"
                      }`}
                    >
                      {scan.type == "Offre LumiŠre" ? "Offre Lumière" : scan.type}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <ToastProvider>
        <HistoryContent />
      </ToastProvider>
    );
  }

  return null;
}

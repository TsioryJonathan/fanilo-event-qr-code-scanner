"use client";

import { useEffect, useState } from "react";
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
import { format } from "date-fns";

interface ScanItem {
  id: number;
  createdAt: string;
  numero: string;
  type: string;
}

function Filters({ onApply }: { onApply: (p: { start?: string; end?: string; q?: string }) => void }) {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [q, setQ] = useState<string>("");

  return (
    <form
      className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({ start, end, q });
      }}
    >
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <Label htmlFor="start">Début</Label>
        <Input
          id="start"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <Label htmlFor="end">Fin</Label>
        <Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1 w-full md:flex-1">
        <Label htmlFor="search">Numéro billet</Label>
        <Input
          id="search"
          placeholder="Rechercher..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Button type="submit" className="flex gap-2">
        <Search className="w-4 h-4" /> Filtrer
      </Button>
    </form>
  );
}

function HistoryContent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScanItem[]>([]);
  const { toast } = useToast();

  const fetchData = async (params: { start?: string; end?: string; q?: string } = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params as Record<string, string>);
      const res = await fetch(`/api/history?${query.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setData(json.scans);
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full md:w-[700px] mx-auto px-4">
      <Filters onApply={fetchData} />

      {loading ? (
        <div className="flex justify-center pt-20">
          <Loader2 className="animate-spin w-10 h-10" />
        </div>
      ) : (
        <Card className="border-2 bg-black/30 w-full mt-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Historique des scans</CardTitle>
            <CardDescription>Total : {data.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun scan trouvé.</p>
            ) : (
              <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {data.map((scan) => (
                  <li
                    key={scan.id}
                    className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Billet {scan.numero}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(scan.createdAt), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm bg-billet-bleu/20 text-billet-bleu px-2 py-1 rounded">
                      {scan.type}
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

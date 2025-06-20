"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type Stat = {
  type: string;
  total: number;
};

export default function Stat() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {loading ? (
        <div className="col-span-full flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        stats.map((stat) => (
          <Card
            key={stat.type}
            className="rounded-lg shadow-lg border border-border hover:shadow-xl transition-shadow duration-200 p-0"
          >
            <CardContent className="px-4 py-2 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-md font-bold  text-text uppercase tracking-wide">
                  {stat.type === "Offre LumiŠre" ? "Offre Lumière" : stat.type}
                </h3>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-primary leading-tight">
                  {stat.total}
                </p>
                <p className="text-sm text-gray-200 mt-1">billets scannés</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

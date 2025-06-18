"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, XCircle, RotateCcw, Ticket, Clock } from "lucide-react";
import Scanner from "@/components/Scanner";
import { ToastProvider, useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TicketDetails {
  id: number;
  type: string;
  numero: string;
  scan_limit: number;
  scans_used: number;
  scans?: string[]; // Scan timestamps
}

function HomeContent() {
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(
    null
  );
  const [activeTab] = useState("scan");
  const { toast } = useToast();

  const handleScanSuccess = useCallback(
    async (data: string) => {
      try {
        const response = await fetch("/api/scanner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: data }),
        });
        let result;
        try {
          result = await response.json();
        } catch (e) {
          console.error("Échec de l’analyse JSON :", e);
          result = { error: `Réponse non-JSON : ${await response.text()}` };
        }
        if (!response.ok) {
          setScanStatus("error");
          setNotification({
            type: "error",
            message: result.error || "Erreur inconnue",
          });
          setTicketDetails(result.details || {});
          toast({
            variant: "destructive",
            title: result.error?.includes("limit")
              ? "Limite de scan atteinte"
              : "Erreur de validation",
            description: result.error || "Erreur inconnue",
          });
          return;
        }
        setScanStatus("success");
        setNotification({ type: "success", message: result.message });
        setTicketDetails(result.ticket || {});
        toast({
          title: "Succès !",
          description: result.message,
        });
      } catch (error) {
        console.error("Erreur de requête :", error);
        setScanStatus("error");
        const errorMessage = "Erreur réseau ou serveur indisponible";
        setNotification({ type: "error", message: errorMessage });
        setTicketDetails(null);
        toast({
          variant: "destructive",
          title: "Erreur système",
          description: errorMessage,
        });
      }
    },
    [toast]
  );

  const resetScan = useCallback(() => {
    setScanStatus("idle");
    setNotification(null);
    setTicketDetails(null);
  }, []);

  return (
    <main className="mx-auto px-5 w-[420px]">
      <Card className="border-2 bg-black/30 w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Scanner QR de l&apos;Événement</CardTitle>
          <CardDescription>
            Scanne les QR codes des participants pour vérifier et enregistrer
            leur entrée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="scan" className="mt-4">
              {scanStatus === "idle" ? (
                <Scanner onScanSuccess={handleScanSuccess} />
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div
                    className={`rounded-full p-3 ${
                      scanStatus === "success" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {scanStatus === "success" ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-medium">
                      {scanStatus === "success"
                        ? "Enregistrement réussi !"
                        : "QR Code invalide"}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {notification?.message || "Participant vérifié"}
                    </p>
                  </div>
                  {ticketDetails && (
                    <div className="mt-4 w-full text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="h-5 w-5 text-gray-600" />
                        <h4 className="font-medium">Détails du billet</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Numéro :</span>
                        <span>{ticketDetails.numero}</span>
                        <span className="text-muted-foreground">Type :</span>
                        <span>{ticketDetails.type || "N/A"}</span>
                        <span className="text-muted-foreground">
                          Utilisations :
                        </span>
                        <span>{ticketDetails.scans_used ?? "N/A"}</span>
                        <span className="text-muted-foreground">
                          Restantes :
                        </span>
                        <span>
                          {ticketDetails.scan_limit &&
                          ticketDetails.scans_used != null
                            ? ticketDetails.scan_limit -
                              ticketDetails.scans_used
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-4">
          {scanStatus !== "idle" && (
            <>
              <Button
                variant="outline"
                onClick={resetScan}
                className="w-full bg-billet-orange-light"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Scanner un autre
              </Button>
              {ticketDetails?.scans && ticketDetails.scans.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Afficher l’historique des scans
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Historique des scans</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      {ticketDetails.scans.length === 0 ? (
                        <p className="text-muted-foreground">
                          Aucun scan enregistré.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {ticketDetails.scans.map((scanDate, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span>
                                {new Date(scanDate).toLocaleString("fr-FR", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                  hour12: false,
                                })}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}

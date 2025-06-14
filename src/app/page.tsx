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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  CheckCircle,
  XCircle,
  RotateCcw,
  CalendarDays,
} from "lucide-react";
import Scanner from "@/components/Scanner"; // Chemin corrigé
import { ToastProvider, useToast } from "@/components/ui/toast";

function HomeContent() {
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [notification, setNotification] = useState<{ 
    type: 'success' | 'error'; 
    message: string 
  } | null>(null);
  const [activeTab, setActiveTab] = useState("scan");
  const { toast } = useToast();

  const handleScanSuccess = useCallback(async (data: string) => {
    try {
      const response = await fetch('/api/scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        setScanStatus('error');
        setNotification({ type: 'error', message: error.message });
        
        // Afficher le toast d'erreur
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.message,
        });
        return;
      }

      const result = await response.json();
      setScanStatus('success');
      setNotification({ type: 'success', message: result.message });
      
      // Afficher le toast de succès
      toast({
        title: "Succès !",
        description: result.message,
      });
    } catch (error) {
      console.error('Scan error:', error);
      setScanStatus('error');
      const errorMessage = 'Une erreur est survenue lors de la validation du billet';
      setNotification({ type: 'error', message: errorMessage });
      
      // Afficher le toast d'erreur
      toast({
        variant: "destructive",
        title: "Erreur système",
        description: errorMessage,
      });
    }

    // Réinitialiser l'état après 3 secondes
    setTimeout(() => {
      setScanStatus('idle');
      setNotification(null);
    }, 3000);
  }, [toast]);

  const resetScan = useCallback(() => {
    setScanStatus("idle");
    setNotification(null);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset scan when switching away from scan tab
    if (value !== "scan" && scanStatus !== "idle") {
      resetScan();
    }
  };

  return (
    <main className="container max-w-md mx-auto px-4">
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Event QR Scanner</CardTitle>
          <CardDescription>
            Scan attendee QR codes to verify and check in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">
                <Camera className="mr-2 h-4 w-4" />
                Scan QR
              </TabsTrigger>
              <TabsTrigger value="event">
                <CalendarDays className="mr-2 h-4 w-4" />
                Event Info
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="mt-4">
              {scanStatus === "idle" ? (
                <Scanner onScanSuccess={handleScanSuccess} />
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className={`rounded-full p-3 ${
                    scanStatus === "success" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {scanStatus === "success" ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-medium">
                      {scanStatus === "success" ? "Check-in Successful!" : "Invalid QR Code"}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {notification?.message || "Attendee verified"}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Ajout du contenu pour l'onglet event */}
            <TabsContent value="event" className="mt-4">
              <div className="text-center py-6">
                <h3 className="text-lg font-medium mb-4">Event Information</h3>
                <div className="space-y-3 text-left">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Event Name</p>
                    <p className="font-medium">Annual Conference 2025</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">June 14, 2025</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">Conference Center</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          {scanStatus !== "idle" && (
            <Button variant="outline" onClick={resetScan}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Scan Another
            </Button>
          )}
          {/* Boutons de test conditionnels selon l'environnement */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <Button variant="outline" onClick={() => handleScanSuccess('test-code-123')}>
                Test Valid QR Code
              </Button>
              <Button variant="outline" onClick={() => handleScanSuccess('invalid-code')}>
                Test Invalid QR Code
              </Button>
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

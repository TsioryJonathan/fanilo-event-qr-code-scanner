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
import { Tabs, TabsContent} from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import Scanner from "@/components/Scanner";
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data }),
      });
      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        result = { message: `Non-JSON response: ${await response.text()}` };
      }
      if (!response.ok) {
        setScanStatus('error');
        setNotification({ type: 'error', message: result.message || 'Unknown error' });
        toast({
          variant: "destructive",
          title: result.message?.includes('limit') ? 'Scan limit reached' : 'Validation Error',
          description: result.message || 'Unknown error',
        });
        return;
      }
      setScanStatus('success');
      setNotification({ type: 'success', message: result.message });
      toast({
        title: "Success!",
        description: result.message,
      });
    } catch (error) {
      console.error('Scan error:', error);
      setScanStatus('error');
      const errorMessage = 'Network error or server unavailable';
      setNotification({ type: 'error', message: errorMessage });
      toast({
        variant: "destructive",
        title: "System Error",
        description: errorMessage,
      });
    }
    setTimeout(() => {
      setScanStatus('idle');
      setNotification(null);
    }, 5000);
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
    <main className="container max-w-md mx-auto px-8">
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
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          {scanStatus !== "idle" && (
            <Button variant="outline" onClick={resetScan}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Scan Another
            </Button>
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

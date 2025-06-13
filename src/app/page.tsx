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
import Scanner from "../components/Scanner";

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const [activeTab, setActiveTab] = useState("scan");

  console.log(scanResult);

  const handleScanSuccess = useCallback((data: string) => {
    alert(data);
  }, []);

  const resetScan = useCallback(() => {
    setScanResult(null);
    setScanStatus("idle");
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
              ) : scanStatus === "success" ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-medium">
                      Check-in Successful!
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Attendee verified
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="rounded-full bg-red-100 p-3">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-medium">Invalid QR Code</h3>
                    <p className="text-muted-foreground mt-1">
                      This QR code is not valid for this event
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
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

"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (data: string) => void;
}

export default function Scanner({ onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-reader";

  const stopScannerSafely = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerDivId);
    return () => {
      stopScannerSafely();
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current || isScanning) return;

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          alert(`QR détecté : ${decodedText}`); // 👈 Affiche une alerte avec le code détecté
          onScanSuccess(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
      setPermissionDenied(false);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setPermissionDenied(true);
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-64 bg-muted rounded-lg overflow-hidden relative">
        <div id={scannerDivId} className="w-full h-full"></div>

        {!isScanning && !permissionDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Camera className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}

        {permissionDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4 text-center">
            <CameraOff className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Camera access denied. Please allow camera access to scan QR codes.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 w-full">
        {!isScanning ? (
          <Button onClick={startScanner} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
        ) : (
          <p className="text-center text-sm text-muted-foreground w-full">
            Scanning…
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Positionnez le QR code à l'intérieur du cadre de scan
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import styles from "./Scanner.module.css";
import { toast } from "@/components/ui/toast";

interface QrScannerProps {
  onScanSuccess: (data: string) => void;
}

export default function Scanner({ onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-reader";
  const eventName = "FANILO FESTIVAL";

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerDivId);

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          scannerRef.current.stop();
          setIsScanning(false);
        } catch (error) {
          console.error("Erreur lors de l’arrêt du scanner :", error);
        }
      }
    };
  }, []);

  const handleScanResult = useCallback(
    async (decodedText: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      try {
        if (scannerRef.current && scannerRef.current.isScanning) {
          await scannerRef.current.stop();
          setIsScanning(false);
        }
        onScanSuccess(decodedText);
      } catch (err) {
        console.error("Erreur pendant le traitement du scan :", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue pendant le traitement du scan.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [onScanSuccess, isProcessing]
  );

  const startScanner = async () => {
    if (!scannerRef.current || isScanning) return;

    setPermissionDenied(false);

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 30,
        },
        handleScanResult,
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Erreur au démarrage du scanner :", err);

      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.message?.includes("Permission")
        ) {
          setPermissionDenied(true);
          toast({
            variant: "destructive",
            title: "Permission refusée",
            description:
              "L’accès à la caméra a été refusé. Veuillez l’autoriser dans les paramètres de votre navigateur.",
          });
        } else if (err.name === "NotFoundError") {
          toast({
            variant: "destructive",
            title: "Caméra introuvable",
            description:
              "Aucun appareil caméra détecté. Veuillez connecter une caméra.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Échec du démarrage",
            description:
              "Impossible de démarrer la caméra. Veuillez réessayer.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erreur inconnue",
          description:
            "Une erreur inattendue est survenue lors du démarrage du scanner.",
        });
      }

      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (error) {
      console.error("Erreur lors de l’arrêt du scanner :", error);
    }
    setIsScanning(false);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto bg-transparent">
      <div className="mb-4">
        <h1 className={`${styles.eventName} animate-fade-in`}>{eventName}</h1>
      </div>

      <div className={styles.scannerFrame}>
        <div
          id={scannerDivId}
          className="w-full h-full object-cover m-0 p-0 block"
        />

        {!isScanning && !isProcessing && (
          <div className={styles.scannerOverlay}>
            <Camera className={`${styles.scannerIcon} h-16 w-16`} />
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Traitement…</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 w-full">
        {!isScanning ? (
          <Button
            onClick={startScanner}
            disabled={isProcessing}
            className="bg-billet-bleu hover:bg-billet-bleu/90 text-white w-full cursor-pointer group"
          >
            <Camera
              className="mr-2 h-5 w-5 text-white group-hover:-translate-y-0.5
            group-hover:scale-110 
            transition-transform ease-in-out duration-75"
            />
            <span>Démarrer le scan</span>
          </Button>
        ) : (
          <Button
            onClick={stopScanner}
            variant="outline"
            disabled={isProcessing}
            className="border-billet-orange text-billet-orange hover:bg-billet-orange/10 w-full cursor-pointer"
          >
            <CameraOff className="mr-2 h-5 w-5 text-billet-orange" />
            <span>Arrêter le scan</span>
          </Button>
        )}
      </div>

      <p className={`${styles.scannerText} text-center`}>
        Placez le QR code dans le cadre du scanner
      </p>

      {permissionDenied && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
          <h4 className="font-medium text-yellow-800 mb-2">
            Autorisations caméra requises
          </h4>
          <p className="text-sm text-yellow-700">
            Pour scanner les QR codes, autorisez l’accès à la caméra dans les
            paramètres de votre navigateur puis rafraîchissez la page.
          </p>
        </div>
      )}
    </div>
  );
}

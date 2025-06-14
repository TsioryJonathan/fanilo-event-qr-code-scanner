"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff } from "lucide-react"
import styles from "./Scanner.module.css"
import { toast } from "@/components/ui/toast"

interface QrScannerProps {
  onScanSuccess: (data: string) => void
}

export default function Scanner({ onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = "qr-reader"

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerDivId)

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          scannerRef.current.stop()
        } catch (error) {
          console.error('Error stopping scanner on unmount:', error)
        }
      }
    }
  }, [])

  const handleScanResult = useCallback(async (decodedText: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop()
        setIsScanning(false)
      }
      onScanSuccess(decodedText)
    } catch (err) {
      console.error('Error processing scan result:', err)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue pendant le traitement du scan."
      })
    } finally {
      setIsProcessing(false)
    }
  }, [onScanSuccess, isProcessing])

  const startScanner = async () => {
    if (!scannerRef.current || isScanning) return

    setPermissionDenied(false)

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanResult,
        () => {}
      )

      setIsScanning(true)
    } catch (err: any) {
      console.error('Error starting scanner:', err)

      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        setPermissionDenied(true)
        toast({
          variant: "destructive",
          title: "Permission refusée",
          description: "L'accès à la caméra a été refusé. Autorisez l'accès dans les paramètres du navigateur."
        })
      } else if (err.name === 'NotFoundError') {
        toast({
          variant: "destructive",
          title: "Caméra non trouvée",
          description: "Aucune caméra n'a été détectée. Veuillez connecter un appareil caméra."
        })
      } else {
        toast({
          variant: "destructive",
          title: "Échec du démarrage",
          description: "Impossible de démarrer la caméra. Essayez à nouveau."
        })
      }

      setIsScanning(false)
    }
  }

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }
    } catch (error) {
      console.error('Error stopping scanner:', error)
    }
    setIsScanning(false)
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className={styles.scannerFrame}>
        <div id={scannerDivId} className="w-full h-full" />

        <div className={styles.scannerGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} />
          ))}
        </div>

        {!isScanning && !isProcessing && (
          <div className={styles.scannerOverlay}>
            <Camera className={`${styles.scannerIcon} h-16 w-16`} />
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Processing...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 w-full">
        {!isScanning ? (
          <Button 
            onClick={startScanner} 
            disabled={isProcessing}
            className="bg-billet-bleu hover:bg-billet-bleu/90 text-white w-full cursor-pointer border border-billet-orange"
          >
            <Camera className="mr-2 h-5 w-5 text-white" />
            <span>Start Scanning</span>
          </Button>
        ) : (
          <Button 
            onClick={stopScanner} 
            variant="outline" 
            disabled={isProcessing}
            className="border-billet-orange text-billet-orange hover:bg-billet-orange/10 w-full cursor-pointer"
          >
            <CameraOff className="mr-2 h-5 w-5 text-billet-orange" />
            <span>Stop Scanning</span>
          </Button>
        )}
      </div>

      <p className={`${styles.scannerText} text-center`}>
        Position the QR code within the scanner frame
      </p>

      {permissionDenied && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
          <h4 className="font-medium text-yellow-800 mb-2">Camera Permission Required</h4>
          <p className="text-sm text-yellow-700">
            To scan QR codes, please allow camera access in your browser settings and refresh the page.
          </p>
        </div>
      )}
    </div>
  )
}

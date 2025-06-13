"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff } from "lucide-react"
import styles from "./Scanner.module.css"
import toast from "@/components/ui/toast"

interface QrScannerProps {
  onScanSuccess: (data: string) => void
}

export default function Scanner({ onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [scanResult, setScanResult] = useState({
    success: false,
    ticket: null,
    message: "",
    remainingScans: 0,
    error: "",
  })
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = "qr-reader"
  const eventName = "FANILO FESTIVAL"
  const [isEventNameAnimated, setIsEventNameAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEventNameAnimated(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Clean up function to safely stop scanner
  const safelyStopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (error) {
        setScanResult({
          error: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    }
  }

  useEffect(() => {
    // Initialize scanner instance once
    scannerRef.current = new Html5Qrcode(scannerDivId)

    // Clean up on component unmount
    return () => {
      safelyStopScanner()
      // Don't try to clear the scanner instance here
      // Just let it be garbage collected
    }
  }, [])

  const startScanner = async () => {
    if (!scannerRef.current || isScanning) return

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // First update the state to show we're stopping
          setIsScanning(false)

          // Then pass the result to the parent component
          onScanSuccess(decodedText)

          // Finally, safely stop the scanner
          try {
            if (scannerRef.current && scannerRef.current.isScanning) {
              await scannerRef.current.stop()
            }
          } catch (error) {
            console.error("Error stopping scanner after successful scan:", error)
          }

          const result = JSON.parse(decodedText)
          if (result.remainingScans === 0) {
            toast.warning(result.message);
          } else {
            toast.success(result.message);
          }
          setScanResult(result)
        },
        () => {}, // Empty error handler to avoid console noise
      )

      setIsScanning(true)
      setPermissionDenied(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
      setPermissionDenied(true)
      setIsScanning(false)
    }
  }

  const stopScanner = () => {
    safelyStopScanner()
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto ">
      <div className="mb-4">
        <h1 
          className={`${styles.eventName} ${isEventNameAnimated ? 'animate-fade-in' : ''}`}
        >
          {eventName}
        </h1>
      </div>

      <div className={styles.scannerFrame}>
        <div id={scannerDivId} className="w-full h-full" />
        
        <div className={styles.scannerGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} />
          ))}
        </div>

        {!isScanning && !permissionDenied && (
          <div className={styles.scannerOverlay}>
            <Camera className={`${styles.scannerIcon} h-16 w-16`} />
          </div>
        )}

        {permissionDenied && (
          <div className={`${styles.scannerOverlay} ${styles.errorState}`}>
            <CameraOff className={`${styles.scannerIcon} h-16 w-16`} />
            <p className="mt-4 text-sm">
              Camera access denied. Please allow camera access to scan QR codes.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 w-full">
        {!isScanning ? (
          <Button 
            onClick={startScanner} 
            className="bg-billet-bleu hover:bg-billet-bleu/90 text-white w-full cursor-pointer border border-billet-orange"
          >
            <Camera className="mr-2 h-5 w-5 text-white" />
            <span>Start Scanning</span>
          </Button>
        ) : (
          <Button 
            onClick={stopScanner} 
            variant="outline" 
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
    </div>
  )
}

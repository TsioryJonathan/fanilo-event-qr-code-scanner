"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff } from "lucide-react"

interface QrScannerProps {
  onScanSuccess: (data: string) => void
}

export default function Scanner({ onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = "qr-reader"

  // Clean up function to safely stop scanner
  const safelyStopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (error) {
        console.error("Error stopping scanner:", error)
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
        },
        () => {}, // Empty error handler to avoid console noise
      )

      setIsScanning(true)
      setPermissionDenied(false)
    } catch (err) {
      console.error("Error starting scanner:", err)
      setPermissionDenied(true)
      setIsScanning(false)
    }
  }

  const stopScanner = () => {
    safelyStopScanner()
  }

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
          <Button onClick={stopScanner} variant="outline" className="w-full">
            <CameraOff className="mr-2 h-4 w-4" />
            Stop Scanning
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">Position the QR code within the scanner frame</p>
    </div>
  )
}

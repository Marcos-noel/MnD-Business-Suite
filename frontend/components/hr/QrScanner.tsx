"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onScan: (value: string) => void;
};

export function QrScanner({ open, title = "Scan QR", onClose, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    async function start() {
      try {
        setError(null);
        if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
          setError("Camera is not available in this browser.");
          return;
        }
        // BarcodeDetector is supported in Chromium-based browsers.
        const Detector = (window as any).BarcodeDetector as
          | (new (arg: { formats: string[] }) => { detect: (src: CanvasImageSource) => Promise<Array<{ rawValue: string }>> })
          | undefined;
        if (!Detector) {
          setError("QR scanning is not supported here. Use Chrome/Edge or enter the code manually.");
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (stopped) return;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const detector = new Detector({ formats: ["qr_code"] });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const tick = async () => {
          if (stopped) return;
          if (video.readyState >= 2) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              const results = await detector.detect(canvas);
              const raw = results?.[0]?.rawValue;
              if (raw) {
                onScan(raw);
                onClose();
                return;
              }
            } catch {
              // ignore frame errors
            }
          }
          raf = window.setTimeout(() => void tick(), 180) as unknown as number;
        };
        void tick();
      } catch (e) {
        setError((e as Error).message);
      }
    }

    void start();

    return () => {
      stopped = true;
      if (raf) window.clearTimeout(raf);
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
    };
  }, [open, onClose, onScan]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} role="button" aria-label="Close scanner" />
      <Card className="relative w-full max-w-lg p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-semibold">{title}</div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl border border-[hsl(var(--c-border))] bg-black">
            <video ref={videoRef} className="h-[360px] w-full object-cover" playsInline muted />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-3 text-xs text-[hsl(var(--c-muted-2))]">Point your camera at the QR code.</div>
      </Card>
    </div>
  );
}


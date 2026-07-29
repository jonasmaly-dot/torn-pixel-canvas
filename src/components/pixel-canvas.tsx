"use client";

import { useEffect, useRef } from "react";

type Pixel = {
  x: number;
  y: number;
  color: string;
};

type Props = {
  pixels: Pixel[];
  gridSize: number;
  zoom: number;
};

export default function PixelCanvas({
  pixels,
  gridSize,
  zoom,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelSize = zoom;

    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const pixel of pixels) {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(
        pixel.x * pixelSize,
        pixel.y * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    ctx.strokeStyle = "#eeeeee";

    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(canvas.width, i * pixelSize);
      ctx.stroke();
    }
  }, [pixels, gridSize, zoom]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        borderRadius: 12,
        background: "#fff",
        display: "block",
      }}
    />
  );
}

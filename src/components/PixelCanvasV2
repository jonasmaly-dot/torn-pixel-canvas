"use client";

import { useEffect, useRef } from "react";

type Pixel = {
  x: number;
  y: number;
  color: string;
};

export default function PixelCanvasV2({
  pixels,
}: {
  pixels: Pixel[];
}) {

const canvasRef = useRef<HTMLCanvasElement>(null);

const GRID_SIZE = 500;
const PIXEL_SIZE = 10;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#f4f4f4",
      }}
    >
      <canvas
       ref={canvasRef}
       width={GRID_SIZE * PIXEL_SIZE}
       height={GRID_SIZE * PIXEL_SIZE}
        style={{
          imageRendering: "pixelated",
          background: "#ffffff",
          cursor: "crosshair",
          display: "block",
        }}
      />
    </div>
  );
}

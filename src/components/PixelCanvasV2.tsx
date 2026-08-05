"use client";

import { useEffect, useRef, useState } from "react";

type Pixel = {
  x: number;
  y: number;
  color: string;
};

const GRID_SIZE = 1000;
const PIXEL_SIZE = 8;

export default function PixelCanvasV2({
  pixels,
}: {
  pixels: Pixel[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#dcdcdc",
      }}
    >
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * PIXEL_SIZE}
        height={GRID_SIZE * PIXEL_SIZE}
        style={{
          position: "absolute",
          left: camera.x,
          top: camera.y,
          imageRendering: "pixelated",
          background: "#ffffff",
          cursor: "grab",
        }}
      />
    </div>
  );
}

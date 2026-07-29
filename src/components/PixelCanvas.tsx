"use client";

type Pixel = {
  x: number;
  y: number;
  color: string;
  owner: {
    playerName: string;
    tornId: number;
  };
};

export default function PixelCanvas({
  pixels,
  gridSize,
  zoom,
}: {
  pixels: Pixel[];
  gridSize: number;
  zoom: number;
}) {
  return (
    <div>
      PixelCanvas funktioniert.
    </div>
  );
}

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

type Props = {
  pixels: Pixel[];
  gridSize: number;
  pixelSize: number;
  selected: { x: number; y: number } | null;
  selectPixel: (
    pixel: { x: number; y: number },
    claimed: boolean
  ) => void;
};

export default function PixelCanvas({
  pixels,
  gridSize,
  pixelSize,
  selected,
  selectPixel,
}: Props) {
  const map = new Map(
    pixels.map((p) => [`${p.x}:${p.y}`, p] as const)
  );

  return (
    <div
    style={{
  overflow: "auto",
  width: "100%",
  height: "75vh",
  padding: 20,
  background: "#1d1f22",
  borderRadius: 12,
      }}
    >
      <div
style={{
  display: "grid",
  gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
  gridTemplateRows: `repeat(${gridSize}, ${pixelSize}px)`,
  width: gridSize * pixelSize,
  height: gridSize * pixelSize,
  background: "#ffffff",
}}
      >
        {Array.from({ length: gridSize * gridSize }, (_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);

          const pixel = map.get(`${x}:${y}`);

          const active =
            selected?.x === x &&
            selected?.y === y;

          return (
            <button
              key={index}
              onClick={() =>
                selectPixel({ x, y }, !!pixel)
              }
              title={
                pixel
                  ? `${pixel.owner.playerName} [${pixel.owner.tornId}]`
                  : `(${x}, ${y})`
              }
style={{
  width: pixelSize,
  height: pixelSize,
  minWidth: pixelSize,
  minHeight: pixelSize,
  maxWidth: pixelSize,
  maxHeight: pixelSize,

  padding: 0,
  margin: 0,

  appearance: "none",
  WebkitAppearance: "none",

  borderRadius: 0,
  display: "block",

  background: pixel?.color ?? "#ffffff",

  border: active
    ? "2px solid red"
    : "1px solid #000",

  cursor: pixel ? "not-allowed" : "pointer",

  boxSizing: "border-box",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

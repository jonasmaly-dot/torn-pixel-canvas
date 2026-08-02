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
        height: "100%",
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

  borderRadius: 10,

  boxShadow:
    "0 12px 35px rgba(0,0,0,.18)",

  overflow: "hidden",
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
                padding: 0,
                margin: 0,
                background: pixel?.color ?? "#ffffff",
                border: active
                  ? "2px solid red"
                  : "1px solid #ececec",
                cursor: pixel
                  ? "not-allowed"
                  : "pointer",
                boxSizing: "border-box",
                transition: "transform .1s ease, filter .15s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

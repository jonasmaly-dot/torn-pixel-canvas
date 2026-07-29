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
  const map = new Map(
    pixels.map((pixel) => [`${pixel.x}:${pixel.y}`, pixel])
  );

  return (
    <div
      style={{
        overflow: "auto",
        borderRadius: "12px",
        border: "2px solid #444",
        background: "#ffffff",
        maxHeight: "70vh",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `${gridSize * zoom}px`,
          height: `${gridSize * zoom}px`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);

          const pixel = map.get(`${x}:${y}`);

          return (
            <div
              key={index}
              title={pixel ? pixel.owner.playerName : "Available"}
              style={{
                width: zoom,
                height: zoom,
                background: pixel?.color ?? "#ffffff",
                border: "1px solid #ececec",
                boxSizing: "border-box",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

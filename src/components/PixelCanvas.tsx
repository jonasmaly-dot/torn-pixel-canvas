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
  selected,
  selectPixel,
}: {
  pixels: Pixel[];
  gridSize: number;
  zoom: number;
  selected: { x: number; y: number } | null;
  selectPixel: (pixel: { x: number; y: number }, claimed: boolean) => void;
}) 
{const map = new Map(
    pixels.map((pixel) => [`${pixel.x}:${pixel.y}`, pixel])
  );

  return (
  <div
    style={{
      overflow: "auto",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }, (_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        const pixel = map.get(`${x}:${y}`);

        return (
          <button
            key={index}
            onClick={() => selectPixel({ x, y }, !!pixel)}
            title={
              pixel
                ? `${pixel.owner.playerName} (${pixel.owner.tornId})`
                : `(${x}, ${y})`
            }
            style={{
              width: zoom,
              height: zoom,
              background: pixel?.color ?? "#ffffff",
              border:
                selected?.x === x && selected?.y === y
                  ? "2px solid red"
                  : "1px solid #ececec",
              padding: 0,
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

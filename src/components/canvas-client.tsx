"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PixelCanvas from "@/components/PixelCanvas";

const COLORS = [
  "#000000","#404040","#808080","#C0C0C0","#FFFFFF",
  "#7F0000","#B22222","#DC2626","#EF4444","#FCA5A5",
  "#FF7F00","#F97316","#FB923C","#FDBA74",
  "#FFFF00","#EAB308","#FACC15","#FEF08A",
  "#006400","#15803D","#16A34A","#22C55E","#86EFAC",
  "#008080","#06B6D4","#67E8F9",
  "#0000CD","#2563EB","#3B82F6","#93C5FD",
  "#4B0082","#7C3AED","#9333EA","#C084FC",
  "#FF1493","#EC4899","#F472B6",
  "#8B4513","#854D0E","#D2B48C"
] as const;
const BASE_CANVAS_SIZE = 640;
type Pixel = { x: number; y: number; color: string; purchasedAt: string | null; owner: { playerName: string; tornId: number } };
type Coordinate = { x: number; y: number };

export default function CanvasClient({ pixels, user, leaders }: { pixels: Pixel[]; user: { name: string; tornId: number; isAdmin: boolean; credits: number }; leaders: { playerName: string; tornId: number; _count: { pixels: number } }[] }) {
  const [selected, setSelected] = useState<Coordinate | null>(null);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [credits, setCredits] = useState(user.credits);
  const [zoom, setZoom] = useState(1);
  const pendingZoom = useRef<{
  mouseX: number;
  mouseY: number;
  oldZoom: number;
} | null>(null);
  const [notice, setNotice] = useState("");
  const [showCredits, setShowCredits] = useState(false);
  
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const map = useMemo(() => new Map(pixels.map(pixel => [`${pixel.x}:${pixel.y}`, pixel])), [pixels]);

  useEffect(() => {
    const refreshCredits = async () => { const response = await fetch("/api/credits", { cache: "no-store" }); if (response.ok) setCredits((await response.json()).credits); };
    const timer = window.setInterval(() => void refreshCredits(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
  const recent = localStorage.getItem("recentColors");
  const fav = localStorage.getItem("favoriteColors");

  if (recent) setRecentColors(JSON.parse(recent));
  if (fav) setFavoriteColors(JSON.parse(fav));
}, []);

  
  function selectPixel(pixel: Coordinate, claimed: boolean) { if (dragRef.current.moved) { dragRef.current.moved = false; return; } if (!claimed) { setSelected(pixel); setNotice(""); } }
      function chooseColor(value: string) {
    setColor(value);

  const updated = [
    value,
    ...recentColors.filter((c) => c !== value),
  ].slice(0, 8);

  setRecentColors(updated);
  localStorage.setItem("recentColors", JSON.stringify(updated));
}

function toggleFavorite(value: string) {
  let updated: string[];

  if (favoriteColors.includes(value)) {
    updated = favoriteColors.filter((c) => c !== value);
  } else {
    updated = [...favoriteColors, value];
  }

  setFavoriteColors(updated);
  localStorage.setItem("favoriteColors", JSON.stringify(updated));
}

function randomColor() {
  const random =
    COLORS[Math.floor(Math.random() * COLORS.length)];

  chooseColor(random);
}
  
  async function buyPixel() {
    
    if (!selected) return;
    setNotice("");
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...selected, color }) });
    const body = await response.json();
    if (!response.ok) { setNotice(body.error ?? "Could not claim this pixel."); return; }
    setCredits(body.credits); setSelected(null); location.reload();
  }
  function startPan(event: React.MouseEvent<HTMLDivElement>) { const viewport = viewportRef.current; if (!viewport || zoom <= 1) return; dragRef.current = { active: true, moved: false, startX: event.clientX, startY: event.clientY, scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop }; }
  function movePan(event: React.MouseEvent<HTMLDivElement>) { const viewport = viewportRef.current; const drag = dragRef.current; if (!viewport || !drag.active) return; const dx = event.clientX - drag.startX; const dy = event.clientY - drag.startY; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; viewport.scrollLeft = drag.scrollLeft - dx; viewport.scrollTop = drag.scrollTop - dy; }

  return <main className="app-shell">
    <header className="app-header"><div><p>TORN CITY COMMUNITY PROJECT</p><h1>COMMUNITY PIXEL ART</h1></div><div><span>{user.name} [{user.tornId}]</span><button className="wallet-button" onClick={() => setShowCredits(true)}>{credits} Pixel Credit{credits === 1 ? "" : "s"}</button>{user.isAdmin && <a className="admin-link" href="/admin">Admin</a>}<button className="logout-button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.assign("/"); }}>Log out</button></div></header>
    <div className="canvas-layout"><section className="canvas-panel panel"><div className="canvas-toolbar"><span><b>Canvas</b> · {pixels.length.toLocaleString()} claimed / {(10_000 - pixels.length).toLocaleString()} available</span><div className="zoom-controls"><button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .25))}>−</button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" disabled={zoom >= 4} onClick={() => setZoom(value => Math.min(4, value + .25))}>+</button></div></div>
<div
  ref={viewportRef}
  onWheel={(e) => {
    e.preventDefault();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldZoom = zoom;
    const newZoom = Math.max(
      0.5,
      Math.min(8, oldZoom + (e.deltaY < 0 ? 0.25 : -0.25))
    );

    if (oldZoom === newZoom) return;

    const scale = newZoom / oldZoom;

    const scrollX = viewport.scrollLeft;
    const scrollY = viewport.scrollTop;

    setZoom(newZoom);

    requestAnimationFrame(() => {
      viewport.scrollLeft =
        (scrollX + mouseX) * scale - mouseX;

      viewport.scrollTop =
        (scrollY + mouseY) * scale - mouseY;
    });
  }}
  style={{
    overflow: "auto",
    width: "100%",
    maxHeight: "75vh",
  }}
>
  <PixelCanvas
    pixels={pixels}
    gridSize={100}
    pixelSize={Math.max(6, Math.round(zoom * 8))}
    selected={selected}
    selectPixel={selectPixel}
  />
</div> <p className="canvas-help">Select one available pixel · choose a colour · spend one Pixel Credit to claim it.</p></section>
      <aside><section className="panel wallet-panel"><p className="panel-kicker">YOUR WALLET</p><strong className="credit-number">{credits}</strong><span>Pixel Credit{credits === 1 ? "" : "s"}</span><p className="muted">Send Xanax first, then use credits whenever you are ready.</p><button className="button" onClick={() => setShowCredits(true)}>Add Pixel Credits</button></section><section className="panel purchase-panel"><p className="panel-kicker">SELECTED PIXEL</p><h2>{selected ? `(${selected.x}, ${selected.y})` : "Choose a pixel"}</h2><div className="color-picker"><span>Colour</span><div style={{display:"grid",gridTemplateColumns:"repeat(8, 1fr)",gap:"6px",marginBottom:"12px"}}>{COLORS.map(value=><button key={value} aria-label={`Select ${value}`} onClick={()=>chooseColor(value)} className={`color-option ${color===value?"active":""}`} style={{background:value,width:"32px",height:"32px",border:color===value?"3px solid white":"1px solid #555"}}/> )}</div><input type="color" value={color} onChange={(e)=>chooseColor(e.target.value)} style={{width:"100%",height:"50px",cursor:"pointer"}}/><p style={{marginTop:"8px"}}>Selected: <strong>{color}</strong></p></div><p className="price-line"><b>1 Pixel Credit</b> will be deducted only after the purchase succeeds.</p><button className="button primary-action" disabled={credits < 1} onClick={buyPixel}>Buy this pixel</button>{credits < 1 && <button className="text-button" onClick={() => setShowCredits(true)}>You need Pixel Credits</button>}{!selected && (<p className="muted">Choose a colour first, then click an available pixel.</p>)}{notice && <p className="notice">{notice}</p>}</section><section className="panel leaderboard"><p className="panel-kicker">COMMUNITY RANKING</p><h2>Top collectors</h2><ol>{leaders.map((leader, index) => <li key={leader.tornId}><span><b>{index + 1}.</b> {leader.playerName}</span><strong>{leader._count.pixels}</strong></li>)}</ol><p className="muted">{pixels.length} claimed · {10_000 - pixels.length} available</p></section></aside></div>
    {showCredits && <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby="credits-title"><section className="payment-modal"><button className="modal-close" aria-label="Close credit instructions" onClick={() => setShowCredits(false)}>×</button><p className="panel-kicker">ADD PIXEL CREDITS</p><h2 id="credits-title">Top up your wallet</h2><div className="payment-rule"><strong>1 Xanax = 1 Pixel Credit</strong></div><p>Send any amount of Xanax in Torn. For example, 100 Xanax adds 100 Pixel Credits.</p><dl><dt>Message</dt><dd><code>pixel</code></dd><dt>Recipient</dt><dd><a href="https://www.torn.com/profiles.php?XID=4337348" target="_blank" rel="noreferrer">Jopi2009 [4337348]</a></dd><dt>Credits</dt><dd>1 per Xanax sent</dd></dl><p className="payment-note">Payments with the exact <code>pixel</code> message are detected automatically within one minute. A Torn transaction ID can only be credited once.</p><button className="button" onClick={() => setShowCredits(false)}>Done</button></section></div>}
  </main>;
}

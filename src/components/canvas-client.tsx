"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const COLORS = ["#ffffff", "#111111", "#dc2626", "#2563eb", "#16a34a", "#eab308", "#f97316", "#9333ea", "#ec4899", "#854d0e"] as const;
const BASE_CANVAS_SIZE = 640;
type Pixel = { x: number; y: number; color: string; purchasedAt: string | null; owner: { playerName: string; tornId: number } };
type Coordinate = { x: number; y: number };

export default function CanvasClient({ pixels, user, leaders }: { pixels: Pixel[]; user: { name: string; tornId: number; isAdmin: boolean; credits: number }; leaders: { playerName: string; tornId: number; _count: { pixels: number } }[] }) {
  const [selected, setSelected] = useState<Coordinate | null>(null);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [credits, setCredits] = useState(user.credits);
  const [zoom, setZoom] = useState(1);
  const [notice, setNotice] = useState("");
  const [showCredits, setShowCredits] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const map = useMemo(() => new Map(pixels.map(pixel => [`${pixel.x}:${pixel.y}`, pixel])), [pixels]);

  useEffect(() => {
    const refreshCredits = async () => { const response = await fetch("/api/credits", { cache: "no-store" }); if (response.ok) setCredits((await response.json()).credits); };
    const timer = window.setInterval(() => void refreshCredits(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function selectPixel(pixel: Coordinate, claimed: boolean) { if (dragRef.current.moved) { dragRef.current.moved = false; return; } if (!claimed) { setSelected(pixel); setNotice(""); } }
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
    <div className="canvas-layout"><section className="canvas-panel panel"><div className="canvas-toolbar"><span><b>Canvas</b> · {pixels.length.toLocaleString()} claimed / {(10_000 - pixels.length).toLocaleString()} available</span><div className="zoom-controls"><button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .25))}>−</button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" disabled={zoom >= 4} onClick={() => setZoom(value => Math.min(4, value + .25))}>+</button></div></div><div ref={viewportRef} className={`canvas-viewport ${zoom > 1 ? "is-zoomed" : ""}`} onMouseDown={startPan} onMouseMove={movePan} onMouseUp={() => { dragRef.current.active = false; }} onMouseLeave={() => { dragRef.current.active = false; }}><div className="canvas-grid" style={{ gridTemplateColumns: "repeat(100, minmax(0, 1fr))", width: `${BASE_CANVAS_SIZE * zoom}px`, height: `${BASE_CANVAS_SIZE * zoom}px` }}>{Array.from({ length: 10_000 }, (_, index) => { const x = index % 100; const y = Math.floor(index / 100); const pixel = map.get(`${x}:${y}`); const active = selected?.x === x && selected?.y === y; const title = pixel ? `${pixel.owner.playerName} [${pixel.owner.tornId}] · ${pixel.color} · ${pixel.purchasedAt ? new Date(pixel.purchasedAt).toLocaleDateString("en-GB") : ""}` : `Available (${x}, ${y})`; return <button key={index} title={title} aria-label={title} onClick={() => selectPixel({ x, y }, Boolean(pixel))} className={`pixel-cell ${active ? "is-selected" : ""}`} style={{ backgroundColor: pixel?.color ?? "#2b2f33" }} />; })}</div></div><p className="canvas-help">Select one available pixel · choose a colour · spend one Pixel Credit to claim it · drag when zoomed in</p></section>
      <aside><section className="panel wallet-panel"><p className="panel-kicker">YOUR WALLET</p><strong className="credit-number">{credits}</strong><span>Pixel Credit{credits === 1 ? "" : "s"}</span><p className="muted">Send Xanax first, then use credits whenever you are ready.</p><button className="button" onClick={() => setShowCredits(true)}>Add Pixel Credits</button></section><section className="panel purchase-panel"><p className="panel-kicker">SELECTED PIXEL</p><h2>{selected ? `(${selected.x}, ${selected.y})` : "Choose a pixel"}</h2>{selected ? <><div className="color-picker"><span>Colour</span><div>{COLORS.map(value => <button key={value} aria-label={`Select ${value}`} onClick={() => setColor(value)} className={`color-option ${color === value ? "active" : ""}`} style={{ background: value }} />)}</div></div><p className="price-line"><b>1 Pixel Credit</b> will be deducted only after the purchase succeeds.</p><button className="button primary-action" disabled={credits < 1} onClick={buyPixel}>Buy this pixel</button>{credits < 1 && <button className="text-button" onClick={() => setShowCredits(true)}>You need Pixel Credits</button>}</> : <p className="muted">Click any unclaimed square. Selecting it does not reserve it.</p>}{notice && <p className="notice">{notice}</p>}</section><section className="panel leaderboard"><p className="panel-kicker">COMMUNITY RANKING</p><h2>Top collectors</h2><ol>{leaders.map((leader, index) => <li key={leader.tornId}><span><b>{index + 1}.</b> {leader.playerName}</span><strong>{leader._count.pixels}</strong></li>)}</ol><p className="muted">{pixels.length} claimed · {10_000 - pixels.length} available</p></section></aside></div>
    {showCredits && <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby="credits-title"><section className="payment-modal"><button className="modal-close" aria-label="Close credit instructions" onClick={() => setShowCredits(false)}>×</button><p className="panel-kicker">ADD PIXEL CREDITS</p><h2 id="credits-title">Top up your wallet</h2><div className="payment-rule"><strong>1 Xanax = 1 Pixel Credit</strong></div><p>Send any amount of Xanax in Torn. For example, 100 Xanax adds 100 Pixel Credits.</p><dl><dt>Message</dt><dd><code>pixel</code></dd><dt>Recipient</dt><dd><a href="https://www.torn.com/profiles.php?XID=4337348" target="_blank" rel="noreferrer">Jopi2009 [4337348]</a></dd><dt>Credits</dt><dd>1 per Xanax sent</dd></dl><p className="payment-note">Payments with the exact <code>pixel</code> message are detected automatically within one minute. A Torn transaction ID can only be credited once.</p><button className="button" onClick={() => setShowCredits(false)}>Done</button></section></div>}
  </main>;
}

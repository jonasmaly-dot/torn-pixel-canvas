import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function ProfilePage({ params }: { params: Promise<{ tornId: string }> }) {
  if (!await getSession()) redirect("/");
  const tornId = Number((await params).tornId);
  if (!Number.isInteger(tornId)) notFound();
  const player = await db.user.findUnique({ where: { tornId }, include: { pixels: { where: { state: "OWNED" }, orderBy: { purchasedAt: "desc" } } } });
  if (!player) notFound();
  const lastPurchase = player.pixels[0]?.purchasedAt;
  return <main className="mx-auto max-w-5xl p-6"><a href="/canvas" className="text-red-400">← Back to canvas</a><section className="panel mt-5"><p className="font-mono text-xs text-red-500">TORN PLAYER PROFILE</p><h1 className="mt-1 text-3xl font-black">{player.playerName}</h1><p className="mt-1 text-zinc-400">Torn ID: {player.tornId}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-zinc-400">Pixels claimed</p><p className="text-3xl font-bold">{player.pixels.length}</p></div><div><p className="text-sm text-zinc-400">Most recent purchase</p><p className="text-lg font-semibold">{lastPurchase?.toLocaleString("en-GB") ?? "No purchases yet"}</p></div></div></section><section className="panel mt-6"><h2 className="font-bold">Pixels owned by {player.playerName}</h2>{player.pixels.length ? <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">{player.pixels.map(pixel => <div className="rounded border border-zinc-800 bg-zinc-950 p-3 text-sm" key={pixel.id}><i className="mr-2 inline-block h-3 w-3 rounded-sm" style={{backgroundColor: pixel.color}} />({pixel.x}|{pixel.y})<p className="mt-1 text-xs text-zinc-500">{pixel.purchasedAt?.toLocaleDateString("en-GB")}</p></div>)}</div> : <p className="mt-3 text-sm text-zinc-500">This player does not own any pixels yet.</p>}</section></main>;
}

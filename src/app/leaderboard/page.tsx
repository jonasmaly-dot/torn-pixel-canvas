import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function LeaderboardPage() {
  if (!await getSession()) redirect("/");
  const [leaders, recent, sold] = await Promise.all([
    db.user.findMany({ orderBy: { pixels: { _count: "desc" } }, take: 100, select: { tornId: true, playerName: true, _count: { select: { pixels: true } } } }),
    db.pixel.findMany({ where: { state: "OWNED" }, orderBy: { purchasedAt: "desc" }, take: 12, include: { owner: { select: { tornId: true, playerName: true } } } }),
    db.pixel.count({ where: { state: "OWNED" } }),
  ]);
  return <main className="mx-auto max-w-5xl p-6"><a href="/canvas" className="text-red-400">← Back to canvas</a><h1 className="mt-4 text-3xl font-black">Leaderboard</h1><div className="mt-6 grid gap-4 sm:grid-cols-3">{[["Claimed", sold], ["Available", 10000-sold], ["Players", leaders.length]].map(([label, value]) => <section className="panel" key={String(label)}><p className="text-sm text-zinc-400">{label}</p><p className="text-3xl font-bold">{Number(value).toLocaleString("en-GB")}</p></section>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="panel"><h2 className="font-bold">Top pixel owners</h2><ol className="mt-4 space-y-3">{leaders.map((player, index) => <li key={player.tornId} className="flex items-center justify-between border-b border-zinc-800 pb-2"><a href={`/profile/${player.tornId}`}>{index+1}. {player.playerName} <span className="text-zinc-500">[{player.tornId}]</span></a><b>{player._count.pixels}</b></li>)}</ol></section><section className="panel"><h2 className="font-bold">Recently claimed</h2><ol className="mt-4 space-y-3">{recent.map(pixel => <li key={pixel.id} className="flex items-center justify-between border-b border-zinc-800 pb-2 text-sm"><span><i className="mr-2 inline-block h-3 w-3 rounded-sm" style={{backgroundColor: pixel.color}} />({pixel.x}|{pixel.y}) · <a className="text-red-400" href={`/profile/${pixel.owner!.tornId}`}>{pixel.owner!.playerName}</a></span><time className="text-zinc-500">{pixel.purchasedAt?.toLocaleDateString("en-GB")}</time></li>)}</ol></section></div></main>;
}

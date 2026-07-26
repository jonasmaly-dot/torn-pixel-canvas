import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CanvasClient from "@/components/canvas-client";
export default async function CanvasPage() { const session = await getSession(); if (!session) redirect("/"); const [pixels, me, leaders] = await Promise.all([db.pixel.findMany({ where: { state: "OWNED" }, include: { owner: { select: { playerName: true, tornId: true } } } }), db.user.findUniqueOrThrow({ where: { id: session.userId } }), db.user.findMany({ take: 5, orderBy: { pixels: { _count: "desc" } }, select: { playerName: true, tornId: true, _count: { select: { pixels: true } } } })]); return <CanvasClient pixels={pixels.map(p => ({ ...p, purchasedAt: p.purchasedAt?.toISOString() ?? null, owner: p.owner! }))} user={{ name: me.playerName, tornId: me.tornId, isAdmin: session.isAdmin, credits: me.credits }} leaders={leaders} />; }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTornKey } from "@/lib/torn";
export async function POST(req: NextRequest) { const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"; if (!rateLimit(`login:${ip}`, 5)) return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 }); try { const { apiKey } = z.object({ apiKey: z.string().min(16) }).parse(await req.json()); const player = await verifyTornKey(apiKey); const user = await db.user.upsert({ where: { tornId: player.player_id }, update: { playerName: player.name }, create: { tornId: player.player_id, playerName: player.name, isAdmin: player.player_id === Number(process.env.ADMIN_TORN_ID) } }); await createSession({ userId: user.id, tornId: user.tornId, isAdmin: user.isAdmin }); return NextResponse.json({ ok: true }); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid request." }, { status: 400 }); } }

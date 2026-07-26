import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";

const inputSchema = z.object({ x: z.number().int().min(0).max(99), y: z.number().int().min(0).max(99), color: z.string().regex(/^#[0-9a-fA-F]{6}$/) });

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!rateLimit(`purchase:${session.userId}`, 10, 60_000)) return NextResponse.json({ error: "Too many purchase attempts." }, { status: 429 });
  try {
    const input = inputSchema.parse(await request.json());
    const result = await db.$transaction(async tx => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: session.userId }, select: { credits: true } });
      if (user.credits < 1) throw new Error("INSUFFICIENT_CREDIT");
      const taken = await tx.pixel.findUnique({ where: { x_y: { x: input.x, y: input.y } } });
      if (taken && taken.state !== "FREE") throw new Error("PIXEL_TAKEN");
      const pixel = taken ? await tx.pixel.update({ where: { id: taken.id }, data: { color: input.color, state: "OWNED", ownerId: session.userId, purchasedAt: new Date() }, include: { owner: { select: { playerName: true, tornId: true } } } }) : await tx.pixel.create({ data: { ...input, color: input.color, state: "OWNED", ownerId: session.userId, purchasedAt: new Date() }, include: { owner: { select: { playerName: true, tornId: true } } } });
      const updated = await tx.user.update({ where: { id: session.userId }, data: { credits: { decrement: 1 } }, select: { credits: true } });
      await tx.order.create({ data: { userId: session.userId, pixelId: pixel.id, status: "PAID", expiresAt: new Date(), paidAt: new Date() } });
      return { pixel, credits: updated.credits };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid pixel data." : error instanceof Error && error.message === "INSUFFICIENT_CREDIT" ? "You need at least one pixel credit." : "That pixel has just been claimed. Please choose another one.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

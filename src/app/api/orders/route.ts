import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";

const schema = z.object({
  x: z.number().int().min(0).max(99),
  y: z.number().int().min(0).max(99),
  color: z.enum(["#ffffff", "#111111", "#dc2626", "#2563eb", "#16a34a", "#eab308", "#f97316", "#9333ea", "#ec4899", "#854d0e"]),
});

/** Uses a serializable transaction so one credit can never purchase two pixels. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!rateLimit(`purchase:${session.userId}`, 20, 60_000)) return NextResponse.json({ error: "Too many purchase attempts. Please wait a moment." }, { status: 429 });

  try {
    const input = schema.parse(await req.json());
    const result = await db.$transaction(async tx => {
      const alreadyClaimed = await tx.pixel.findUnique({ where: { x_y: { x: input.x, y: input.y } }, select: { state: true } });
      if (alreadyClaimed && alreadyClaimed.state !== "FREE") throw new Error("PIXEL_UNAVAILABLE");

      // This conditional update is the credit lock: only one concurrent request can decrement the final credit.
      const debited = await tx.user.updateMany({ where: { id: session.userId, credits: { gte: 1 } }, data: { credits: { decrement: 1 } } });
      if (debited.count !== 1) throw new Error("INSUFFICIENT_CREDITS");

      const pixel = alreadyClaimed
        ? await tx.pixel.update({ where: { x_y: { x: input.x, y: input.y } }, data: { color: input.color, state: "OWNED", ownerId: session.userId, purchasedAt: new Date() } })
        : await tx.pixel.create({ data: { ...input, state: "OWNED", ownerId: session.userId, purchasedAt: new Date() } });
      await tx.order.create({ data: { userId: session.userId, pixelId: pixel.id, status: "PAID", paidAt: new Date() } });
      const user = await tx.user.findUniqueOrThrow({ where: { id: session.userId }, select: { credits: true } });
      return { credits: user.credits };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ ok: true, credits: result.credits });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid pixel data." : error instanceof Error && error.message === "INSUFFICIENT_CREDITS" ? "You need at least one Pixel Credit." : "This pixel was just claimed by another player.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

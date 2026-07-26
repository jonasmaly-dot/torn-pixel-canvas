import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const user = await db.user.findUniqueOrThrow({ where: { id: session.userId }, select: { credits: true } });
  return NextResponse.json({ credits: user.credits });
}

import { NextRequest } from "next/server";
export function isSameOrigin(req: NextRequest) { const origin = req.headers.get("origin"); return !origin || origin === new URL(req.url).origin; }

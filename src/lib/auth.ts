import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const name = "tpc_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
type Session = { userId: string; tornId: number; isAdmin: boolean };
export async function createSession(session: Session) {
  const token = await new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set(name, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(name)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload as unknown as Session; } catch { return null; }
}
export async function clearSession() { (await cookies()).delete(name); }

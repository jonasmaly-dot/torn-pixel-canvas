import { z } from "zod";
const playerSchema = z.object({ player_id: z.number(), name: z.string() }).passthrough();
export async function verifyTornKey(key: string) {
  // `basic` returns only the key owner identity; no buyer key is retained after this call.
  const response = await fetch(`https://api.torn.com/user/?selections=basic&key=${encodeURIComponent(key)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("The Torn API is currently unavailable.");
  const body = await response.json();
  if (body.error) throw new Error("The Torn API key is invalid or does not have the required permission.");
  return playerSchema.parse(body);
}
export type IncomingItem = { externalId: string; senderId: number; item: string; amount: number; message?: string; occurredAt: Date };
export async function fetchAdminIncomingItems(): Promise<IncomingItem[]> {
  // This must use ONLY the owner's server-side custom key. Never use a buyer key for payment polling.
  // Map the response of the permitted `user/log` / incoming-item selection here after confirming it in Swagger.
  return [];
}

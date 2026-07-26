import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { fetchAdminIncomingItems } from "@/lib/torn";

/**
 * Credits a player only once for each immutable Torn log ID. Payments must be
 * Xanax transfers with the message `pixel`; any positive amount adds that many credits.
 */
export async function reconcilePayments() {
  const incoming = await fetchAdminIncomingItems();
  for (const event of incoming.filter(item => item.item === "Xanax" && item.amount > 0 && item.message?.trim().toLowerCase() === "pixel")) {
    await db.$transaction(async tx => {
      // The unique externalId constraint makes retries safe: a transaction is never credited twice.
      if (await tx.transaction.findUnique({ where: { externalId: event.externalId } })) return;
      const user = await tx.user.findUnique({ where: { tornId: event.senderId }, select: { id: true } });
      await tx.transaction.create({ data: { externalId: event.externalId, senderId: event.senderId, item: event.item, amount: event.amount, message: event.message, occurredAt: event.occurredAt, creditsAdded: user ? event.amount : 0, processed: Boolean(user) } });
      if (user) await tx.user.update({ where: { id: user.id }, data: { credits: { increment: event.amount } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}

async function runForever() {
  await reconcilePayments();
  setInterval(() => void reconcilePayments().catch(console.error), 60_000);
}

if (require.main === module) runForever().catch(error => { console.error(error); process.exit(1); });

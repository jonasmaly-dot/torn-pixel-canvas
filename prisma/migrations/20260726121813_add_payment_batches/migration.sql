-- DropIndex
DROP INDEX "Order_status_expiresAt_idx";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PAID',
ALTER COLUMN "expiresAt" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

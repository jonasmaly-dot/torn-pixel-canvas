-- Credit balance is only increased from an incoming Torn transaction with a
-- unique external log id; the application performs both operations atomically.
ALTER TABLE "User" ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Transaction" ADD COLUMN "message" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "creditsAdded" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Pixel" ALTER COLUMN "state" SET DEFAULT 'FREE';

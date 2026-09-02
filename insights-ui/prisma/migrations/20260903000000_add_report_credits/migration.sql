-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('Purchase', 'ReportSpend', 'Refund', 'AdminGrant');

-- CreateEnum
CREATE TYPE "CreditReportKind" AS ENUM ('Stock', 'Etf');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripe_customer_id" TEXT;

-- AlterTable
ALTER TABLE "tickers_v1" ADD COLUMN     "last_report_generated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "etfs" ADD COLUMN     "last_report_generated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "type" "CreditTransactionType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "stripe_checkout_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "amount_in_cents" INTEGER,
    "currency" TEXT,
    "report_kind" "CreditReportKind",
    "report_target_id" TEXT,
    "report_label" TEXT,
    "generation_request_id" TEXT,
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_transactions_stripe_checkout_session_id_key" ON "credit_transactions"("stripe_checkout_session_id");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_created_at_idx" ON "credit_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_generation_request_id_idx" ON "credit_transactions"("generation_request_id");

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill the "report generated on" date from the newest completed generation
-- request so existing tickers/ETFs show a real date instead of nothing.
UPDATE "tickers_v1" t
SET "last_report_generated_at" = r."completed_at"
FROM (
    SELECT DISTINCT ON ("ticker_id") "ticker_id", "completed_at"
    FROM "ticker_v1_generation_requests"
    WHERE "status" = 'Completed' AND "completed_at" IS NOT NULL
    ORDER BY "ticker_id", "completed_at" DESC
) r
WHERE t."id" = r."ticker_id";

UPDATE "etfs" e
SET "last_report_generated_at" = r."completed_at"
FROM (
    SELECT DISTINCT ON ("etf_id") "etf_id", "completed_at"
    FROM "etf_generation_requests"
    WHERE "status" = 'Completed' AND "completed_at" IS NOT NULL
    ORDER BY "etf_id", "completed_at" DESC
) r
WHERE e."id" = r."etf_id";

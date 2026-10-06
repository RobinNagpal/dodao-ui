-- The credit balance and its ledger move to Stripe (customer balance transactions).
-- Purchases were never enabled in production, so credit_transactions only holds
-- local test data and is dropped rather than migrated.

-- CreateEnum
CREATE TYPE "ReportSpendStatus" AS ENUM ('InProgress', 'Completed', 'Failed');

-- DropForeignKey
ALTER TABLE "credit_transactions" DROP CONSTRAINT "credit_transactions_user_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "credits",
ADD COLUMN     "first_purchase_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "credit_transactions";

-- DropEnum
DROP TYPE "CreditTransactionType";

-- CreateTable
CREATE TABLE "report_spends" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "report_kind" "CreditReportKind" NOT NULL,
    "report_target_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "report_label" TEXT NOT NULL,
    "generation_request_id" TEXT NOT NULL,
    "status" "ReportSpendStatus" NOT NULL DEFAULT 'InProgress',
    "stripe_debit_txn_id" TEXT,
    "settled_at" TIMESTAMP(3),
    "result_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_spends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_credit_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "stripe_checkout_session_id" TEXT NOT NULL,
    "stripe_payment_intent_id" TEXT,
    "stripe_credit_txn_id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_credit_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_spends_generation_request_id_key" ON "report_spends"("generation_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_spends_stripe_debit_txn_id_key" ON "report_spends"("stripe_debit_txn_id");

-- CreateIndex
CREATE INDEX "report_spends_user_id_status_idx" ON "report_spends"("user_id", "status");

-- CreateIndex
CREATE INDEX "report_spends_user_id_settled_at_result_seen_at_idx" ON "report_spends"("user_id", "settled_at", "result_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_credit_purchases_stripe_checkout_session_id_key" ON "stripe_credit_purchases"("stripe_checkout_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_credit_purchases_stripe_credit_txn_id_key" ON "stripe_credit_purchases"("stripe_credit_txn_id");

-- CreateIndex
CREATE INDEX "stripe_credit_purchases_user_id_created_at_idx" ON "stripe_credit_purchases"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "report_spends" ADD CONSTRAINT "report_spends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_credit_purchases" ADD CONSTRAINT "stripe_credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


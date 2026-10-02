-- AlterTable
ALTER TABLE "credit_transactions" ADD COLUMN     "result_seen_at" TIMESTAMP(3);

-- Runs that finished before this column existed count as already seen, so
-- users aren't shown a pile of old "report ready" notices after deploy.
UPDATE "credit_transactions"
SET "result_seen_at" = "settled_at"
WHERE "type" = 'ReportSpend' AND "settled_at" IS NOT NULL;

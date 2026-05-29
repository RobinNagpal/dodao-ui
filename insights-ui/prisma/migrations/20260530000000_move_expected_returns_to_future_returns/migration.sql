-- Move the expected forward-return estimates off the key-facts report and into a
-- dedicated table populated by the Future Performance Outlook report.

-- DropColumns on the key-facts report (the returns now live on etf_future_returns)
ALTER TABLE "etf_key_facts_reports" DROP COLUMN IF EXISTS "expected_next_1yr_returns";
ALTER TABLE "etf_key_facts_reports" DROP COLUMN IF EXISTS "expected_next_1yr_returns_reason";
ALTER TABLE "etf_key_facts_reports" DROP COLUMN IF EXISTS "expected_next_3yr_returns";
ALTER TABLE "etf_key_facts_reports" DROP COLUMN IF EXISTS "expected_next_3yr_returns_reason";
ALTER TABLE "etf_key_facts_reports" DROP COLUMN IF EXISTS "expected_next_5yr_returns";
ALTER TABLE "etf_key_facts_reports" DROP COLUMN IF EXISTS "expected_next_5yr_returns_reason";

-- CreateTable
CREATE TABLE "etf_future_returns" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "expected_next_1yr_returns" DOUBLE PRECISION,
    "expected_next_1yr_returns_reason" TEXT,
    "expected_next_3yr_returns" DOUBLE PRECISION,
    "expected_next_3yr_returns_reason" TEXT,
    "expected_next_5yr_returns" DOUBLE PRECISION,
    "expected_next_5yr_returns_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_future_returns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_future_returns_etf_id_key" ON "etf_future_returns"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_future_returns" ADD CONSTRAINT "etf_future_returns_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

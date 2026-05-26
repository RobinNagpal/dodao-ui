-- CreateTable
CREATE TABLE "etf_key_facts_reports" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "key_facts" TEXT,
    "green_flags" JSONB,
    "red_flags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_key_facts_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_key_facts_reports_etf_id_key" ON "etf_key_facts_reports"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_key_facts_reports" ADD CONSTRAINT "etf_key_facts_reports_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing index_strategy text into the new table
INSERT INTO "etf_key_facts_reports" ("id", "etf_id", "space_id", "key_facts", "created_at", "updated_at")
SELECT (md5(random()::text || clock_timestamp()::text))::uuid, "id", "space_id", "index_strategy", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "etfs"
WHERE "index_strategy" IS NOT NULL;

-- Drop the old single-column storage on etfs
ALTER TABLE "etfs" DROP COLUMN "index_strategy";

-- Rename the generation-request regenerate flag to match the renamed report
ALTER TABLE "etf_generation_requests" RENAME COLUMN "regenerate_index_strategy" TO "regenerate_key_facts";

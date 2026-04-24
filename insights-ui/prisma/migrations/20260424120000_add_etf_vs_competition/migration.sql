-- AlterTable
ALTER TABLE "etf_generation_requests" ADD COLUMN     "regenerate_competition" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "etf_vs_competition" (
    "id" TEXT NOT NULL,
    "overall_analysis_details" TEXT NOT NULL,
    "competition_analysis" JSONB[],
    "etf_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "etf_vs_competition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_vs_competition_etf_id_key" ON "etf_vs_competition"("etf_id");

-- CreateIndex
CREATE INDEX "etf_vs_competition_space_id_etf_id_idx" ON "etf_vs_competition"("space_id", "etf_id");

-- CreateIndex
CREATE INDEX "etf_vs_competition_etf_id_idx" ON "etf_vs_competition"("etf_id");

-- CreateIndex
CREATE UNIQUE INDEX "etf_vs_competition_space_id_etf_id_key" ON "etf_vs_competition"("space_id", "etf_id");

-- AddForeignKey
ALTER TABLE "etf_vs_competition" ADD CONSTRAINT "etf_vs_competition_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

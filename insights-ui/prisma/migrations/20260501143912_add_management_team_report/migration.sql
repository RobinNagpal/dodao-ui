-- CreateEnum
CREATE TYPE "ManagementTeamAlignmentVerdict" AS ENUM ('OwnerOperator', 'StronglyAligned', 'Aligned', 'WeaklyAligned', 'Misaligned');

-- CreateTable
CREATE TABLE "ticker_v1_management_team_reports" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_analysis" TEXT NOT NULL,
    "alignment_verdict" "ManagementTeamAlignmentVerdict" NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_management_team_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticker_v1_management_team_reports_ticker_id_idx" ON "ticker_v1_management_team_reports"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_management_team_reports_space_id_ticker_id_idx" ON "ticker_v1_management_team_reports"("space_id", "ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_management_team_reports_space_id_ticker_id_key" ON "ticker_v1_management_team_reports"("space_id", "ticker_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_management_team_reports" ADD CONSTRAINT "ticker_v1_management_team_reports_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN "regenerate_management_team" BOOLEAN NOT NULL DEFAULT false;

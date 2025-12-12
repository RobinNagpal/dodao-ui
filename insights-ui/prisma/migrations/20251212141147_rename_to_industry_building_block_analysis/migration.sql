/*
  Warnings:

  - You are about to drop the `ticker_v1_sub_industry_analysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ticker_v1_sub_industry_analysis" DROP CONSTRAINT "ticker_v1_sub_industry_analysis_ticker_v1_industry_analysi_fkey";

-- DropTable
DROP TABLE "ticker_v1_sub_industry_analysis";

-- CreateTable
CREATE TABLE "industry_building_block_analysis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "building_block_key" TEXT NOT NULL,
    "ticker_v1_industry_analysis_id" TEXT NOT NULL,
    "meta_description" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_building_block_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "industry_building_block_analysis_ticker_v1_industry_analysi_idx" ON "industry_building_block_analysis"("ticker_v1_industry_analysis_id");

-- AddForeignKey
ALTER TABLE "industry_building_block_analysis" ADD CONSTRAINT "industry_building_block_analysis_ticker_v1_industry_analys_fkey" FOREIGN KEY ("ticker_v1_industry_analysis_id") REFERENCES "ticker_v1_industry_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

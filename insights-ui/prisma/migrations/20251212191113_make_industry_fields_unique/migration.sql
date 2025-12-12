/*
  Warnings:

  - A unique constraint covering the columns `[building_block_key]` on the table `industry_building_block_analysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[industry_key]` on the table `ticker_v1_industry_analysis` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "industry_building_block_analysis_building_block_key_key" ON "industry_building_block_analysis"("building_block_key");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_industry_analysis_industry_key_key" ON "ticker_v1_industry_analysis"("industry_key");

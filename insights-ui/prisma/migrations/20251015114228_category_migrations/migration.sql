/*
  Warnings:

  - The primary key for the `TickerV1SubIndustry` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "tickers_v1" DROP CONSTRAINT "tickers_v1_sub_industry_key_fkey";

-- DropIndex
DROP INDEX "TickerV1SubIndustry_industry_key_sub_industry_key_idx";

-- AlterTable
ALTER TABLE "TickerV1SubIndustry" DROP CONSTRAINT "TickerV1SubIndustry_pkey",
ADD CONSTRAINT "TickerV1SubIndustry_pkey" PRIMARY KEY ("industry_key", "sub_industry_key");

-- AddForeignKey
ALTER TABLE "tickers_v1" ADD CONSTRAINT "tickers_v1_industry_key_sub_industry_key_fkey" FOREIGN KEY ("industry_key", "sub_industry_key") REFERENCES "TickerV1SubIndustry"("industry_key", "sub_industry_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_category_factors" ADD CONSTRAINT "analysis_category_factors_industry_key_fkey" FOREIGN KEY ("industry_key") REFERENCES "TickerV1Industry"("industry_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_category_factors" ADD CONSTRAINT "analysis_category_factors_industry_key_sub_industry_key_fkey" FOREIGN KEY ("industry_key", "sub_industry_key") REFERENCES "TickerV1SubIndustry"("industry_key", "sub_industry_key") ON DELETE RESTRICT ON UPDATE CASCADE;

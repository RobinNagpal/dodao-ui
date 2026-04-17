/*
  Warnings:

  - You are about to drop the column `created_by` on the `etf_financial_info` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `etf_financial_info` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `etfs` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `etfs` table. All the data in the column will be lost.
  - You are about to drop the column `inception_date` on the `etfs` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `etfs` table. All the data in the column will be lost.
  - You are about to drop the column `segment` on the `etfs` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `etfs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "etfs_provider_idx";

-- AlterTable
ALTER TABLE "etf_financial_info" DROP COLUMN "created_by",
DROP COLUMN "updated_by";

-- AlterTable
ALTER TABLE "etfs" DROP COLUMN "category",
DROP COLUMN "created_by",
DROP COLUMN "inception_date",
DROP COLUMN "provider",
DROP COLUMN "segment",
DROP COLUMN "updated_by",
ADD COLUMN     "inception" TEXT;

-- CreateTable
CREATE TABLE "etf_stock_analyzer_info" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "symbol" TEXT,
    "fund_name" TEXT,
    "asset_class" TEXT,
    "stock_price" TEXT,
    "percent_change" TEXT,
    "isin_number" TEXT,
    "cusip_number" TEXT,
    "ma_200_chg_percent" TEXT,
    "ma_150_chg_percent" TEXT,
    "ma_50_chg_percent" TEXT,
    "ma_20_chg_percent" TEXT,
    "ma_200" DOUBLE PRECISION,
    "ma_150" DOUBLE PRECISION,
    "ma_50" DOUBLE PRECISION,
    "ma_20" DOUBLE PRECISION,
    "tags" TEXT,
    "atl_date" TEXT,
    "atl_chg_percent" TEXT,
    "atl" DOUBLE PRECISION,
    "ath_date" TEXT,
    "ath_chg_percent" TEXT,
    "ath" DOUBLE PRECISION,
    "low_52w_date" TEXT,
    "high_52w_date" TEXT,
    "high_52w_chg" TEXT,
    "low_52w_chg" TEXT,
    "cagr_20y" TEXT,
    "cagr_15y" TEXT,
    "cagr_10y" TEXT,
    "cagr_5y" TEXT,
    "cagr_3y" TEXT,
    "cagr_1y" TEXT,
    "return_20y" TEXT,
    "return_15y" TEXT,
    "return_10y" TEXT,
    "return_5y" TEXT,
    "return_3y" TEXT,
    "return_1y" TEXT,
    "return_ytd" TEXT,
    "return_6m" TEXT,
    "return_3m" TEXT,
    "return_1m" TEXT,
    "change_20y" TEXT,
    "change_15y" TEXT,
    "change_10y" TEXT,
    "change_5y" TEXT,
    "change_3y" TEXT,
    "change_1y" TEXT,
    "change_ytd" TEXT,
    "change_6m" TEXT,
    "change_3m" TEXT,
    "change_1m" TEXT,
    "change_1w" TEXT,
    "options" TEXT,
    "leverage" TEXT,
    "country" TEXT,
    "region" TEXT,
    "payment_date" TEXT,
    "ex_div_date" TEXT,
    "div_growth_10y" TEXT,
    "div_growth_5y" TEXT,
    "div_growth_3y" TEXT,
    "div_years" INTEGER,
    "div_gr_years" INTEGER,
    "div_growth" TEXT,
    "last_div" DOUBLE PRECISION,
    "div_dollars" DOUBLE PRECISION,
    "sortino" DOUBLE PRECISION,
    "atr" DOUBLE PRECISION,
    "sharpe" DOUBLE PRECISION,
    "index" TEXT,
    "price_curr" TEXT,
    "beta_1y" DOUBLE PRECISION,
    "beta_2y" DOUBLE PRECISION,
    "beta_5y" DOUBLE PRECISION,
    "rsi" DOUBLE PRECISION,
    "rsi_w" DOUBLE PRECISION,
    "rsi_m" DOUBLE PRECISION,
    "issuer" TEXT,
    "category" TEXT,
    "chg_open_percent" TEXT,
    "open" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "prev_close" DOUBLE PRECISION,
    "price_date" TEXT,
    "premarket_price" DOUBLE PRECISION,
    "premarket_chg_percent" TEXT,
    "gap_percent" TEXT,
    "rel_volume" TEXT,
    "avg_volume" BIGINT,
    "dollar_vol" BIGINT,
    "afterhr_close" DOUBLE PRECISION,
    "afterhr_chg_percent" TEXT,
    "afterhr_price" DOUBLE PRECISION,
    "pre_volume" BIGINT,
    "premarket_close" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_stock_analyzer_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_stock_analyzer_info_etf_id_key" ON "etf_stock_analyzer_info"("etf_id");

-- CreateIndex
CREATE INDEX "etf_stock_analyzer_info_etf_id_idx" ON "etf_stock_analyzer_info"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_stock_analyzer_info" ADD CONSTRAINT "etf_stock_analyzer_info_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

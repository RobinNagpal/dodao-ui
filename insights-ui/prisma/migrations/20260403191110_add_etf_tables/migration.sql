-- AlterTable
ALTER TABLE "_FavouriteTickerToUserTickerList" ADD CONSTRAINT "_FavouriteTickerToUserTickerList_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FavouriteTickerToUserTickerList_AB_unique";

-- AlterTable
ALTER TABLE "_FavouriteTickerToUserTickerTag" ADD CONSTRAINT "_FavouriteTickerToUserTickerTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FavouriteTickerToUserTickerTag_AB_unique";

-- AlterTable
ALTER TABLE "_PortfolioTickerToUserTickerList" ADD CONSTRAINT "_PortfolioTickerToUserTickerList_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PortfolioTickerToUserTickerList_AB_unique";

-- AlterTable
ALTER TABLE "_PortfolioTickerToUserTickerTag" ADD CONSTRAINT "_PortfolioTickerToUserTickerTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PortfolioTickerToUserTickerTag_AB_unique";

-- CreateTable
CREATE TABLE "etfs" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "segment" TEXT,
    "category" TEXT,
    "inception_date" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "etfs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etf_financial_info" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "aum" TEXT,
    "expense_ratio" DOUBLE PRECISION,
    "pe" DOUBLE PRECISION,
    "shares_out" TEXT,
    "dividend_ttm" DOUBLE PRECISION,
    "dividend_yield" DOUBLE PRECISION,
    "payout_frequency" TEXT,
    "payout_ratio" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "year_high" DOUBLE PRECISION,
    "year_low" DOUBLE PRECISION,
    "beta" DOUBLE PRECISION,
    "holdings" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "etf_financial_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "etfs_symbol_idx" ON "etfs"("symbol");

-- CreateIndex
CREATE INDEX "etfs_provider_idx" ON "etfs"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "etfs_space_id_symbol_exchange_key" ON "etfs"("space_id", "symbol", "exchange");

-- CreateIndex
CREATE UNIQUE INDEX "etf_financial_info_etf_id_key" ON "etf_financial_info"("etf_id");

-- CreateIndex
CREATE INDEX "etf_financial_info_etf_id_idx" ON "etf_financial_info"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_financial_info" ADD CONSTRAINT "etf_financial_info_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

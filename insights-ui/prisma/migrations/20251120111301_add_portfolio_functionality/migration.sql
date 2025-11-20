-- CreateTable
CREATE TABLE "portfolio_manager_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_description" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "portfolio_manager_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "portfolio_manager_profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_description" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_tickers" (
    "id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "allocation" DOUBLE PRECISION NOT NULL,
    "detailed_description" TEXT,
    "competitors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alternatives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "portfolio_tickers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PortfolioTickerToUserTickerTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PortfolioTickerToUserTickerList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_manager_profiles_user_id_key" ON "portfolio_manager_profiles"("user_id");

-- CreateIndex
CREATE INDEX "portfolio_manager_profiles_user_id_idx" ON "portfolio_manager_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_manager_profiles_space_id_user_id_key" ON "portfolio_manager_profiles"("space_id", "user_id");

-- CreateIndex
CREATE INDEX "portfolios_portfolio_manager_profile_id_idx" ON "portfolios"("portfolio_manager_profile_id");

-- CreateIndex
CREATE INDEX "portfolio_tickers_portfolio_id_idx" ON "portfolio_tickers"("portfolio_id");

-- CreateIndex
CREATE INDEX "portfolio_tickers_ticker_id_idx" ON "portfolio_tickers"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_tickers_space_id_portfolio_id_ticker_id_key" ON "portfolio_tickers"("space_id", "portfolio_id", "ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "_PortfolioTickerToUserTickerTag_AB_unique" ON "_PortfolioTickerToUserTickerTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PortfolioTickerToUserTickerTag_B_index" ON "_PortfolioTickerToUserTickerTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PortfolioTickerToUserTickerList_AB_unique" ON "_PortfolioTickerToUserTickerList"("A", "B");

-- CreateIndex
CREATE INDEX "_PortfolioTickerToUserTickerList_B_index" ON "_PortfolioTickerToUserTickerList"("B");

-- AddForeignKey
ALTER TABLE "portfolio_manager_profiles" ADD CONSTRAINT "portfolio_manager_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_portfolio_manager_profile_id_fkey" FOREIGN KEY ("portfolio_manager_profile_id") REFERENCES "portfolio_manager_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_tickers" ADD CONSTRAINT "portfolio_tickers_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_tickers" ADD CONSTRAINT "portfolio_tickers_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PortfolioTickerToUserTickerTag" ADD CONSTRAINT "_PortfolioTickerToUserTickerTag_A_fkey" FOREIGN KEY ("A") REFERENCES "portfolio_tickers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PortfolioTickerToUserTickerTag" ADD CONSTRAINT "_PortfolioTickerToUserTickerTag_B_fkey" FOREIGN KEY ("B") REFERENCES "user_ticker_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PortfolioTickerToUserTickerList" ADD CONSTRAINT "_PortfolioTickerToUserTickerList_A_fkey" FOREIGN KEY ("A") REFERENCES "portfolio_tickers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PortfolioTickerToUserTickerList" ADD CONSTRAINT "_PortfolioTickerToUserTickerList_B_fkey" FOREIGN KEY ("B") REFERENCES "user_ticker_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

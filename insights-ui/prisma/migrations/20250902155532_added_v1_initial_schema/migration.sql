-- CreateEnum
CREATE TYPE "EvaluationResult" AS ENUM ('Pass', 'Fail');

-- CreateEnum
CREATE TYPE "TickerAnalysisCategory" AS ENUM ('BusinessAndMoat', 'FinancialStatementAnalysis', 'PastPerformance', 'FutureGrowth', 'VsCompetition', 'FairValue');

-- CreateTable
CREATE TABLE "tickers_v1" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "industry_key" TEXT NOT NULL,
    "sub_industry_key" TEXT NOT NULL,
    "website_url" TEXT,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',

    CONSTRAINT "tickers_v1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_category_factors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry_key" TEXT NOT NULL,
    "sub_industry_key" TEXT NOT NULL,
    "category_key" "TickerAnalysisCategory" NOT NULL,
    "factor_analysis_key" TEXT NOT NULL,
    "factor_analysis_title" TEXT NOT NULL,
    "factor_analysis_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',

    CONSTRAINT "analysis_category_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticker_v1_category_analysis_results" (
    "id" TEXT NOT NULL,
    "category_key" "TickerAnalysisCategory" NOT NULL,
    "summary" TEXT NOT NULL,
    "introduction_to_analysis" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_category_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticker_v1_analysis_category_factor_results" (
    "id" TEXT NOT NULL,
    "category_key" "TickerAnalysisCategory" NOT NULL,
    "analysis_category_factor_id" TEXT NOT NULL,
    "analysis_explanation" TEXT NOT NULL,
    "result" "EvaluationResult" NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_analysis_category_factor_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticker_v1_investor_analysis_results" (
    "id" TEXT NOT NULL,
    "investor_key" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_analysis" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_investor_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticker_v1_future_risks" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_analysis" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_future_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticker_v1_vs_competition" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "introduction_to_analysis" TEXT NOT NULL,
    "competition_analysis" JSONB NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_vs_competition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickers_v1_space_id_symbol_exchange_key" ON "tickers_v1"("space_id", "symbol", "exchange");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_category_factors_space_id_industry_key_sub_industr_key" ON "analysis_category_factors"("space_id", "industry_key", "sub_industry_key", "category_key", "factor_analysis_key");

-- CreateIndex
CREATE INDEX "ticker_v1_category_analysis_results_ticker_id_idx" ON "ticker_v1_category_analysis_results"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_category_analysis_results_space_id_ticker_id_cate_key" ON "ticker_v1_category_analysis_results"("space_id", "ticker_id", "category_key");

-- CreateIndex
CREATE INDEX "ticker_v1_analysis_category_factor_results_ticker_id_idx" ON "ticker_v1_analysis_category_factor_results"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_analysis_category_factor_results_analysis_categor_idx" ON "ticker_v1_analysis_category_factor_results"("analysis_category_factor_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_analysis_category_factor_results_space_id_ticker__key" ON "ticker_v1_analysis_category_factor_results"("space_id", "ticker_id", "analysis_category_factor_id");

-- CreateIndex
CREATE INDEX "ticker_v1_investor_analysis_results_ticker_id_idx" ON "ticker_v1_investor_analysis_results"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_investor_analysis_results_space_id_ticker_id_inve_key" ON "ticker_v1_investor_analysis_results"("space_id", "ticker_id", "investor_key");

-- CreateIndex
CREATE INDEX "ticker_v1_future_risks_ticker_id_idx" ON "ticker_v1_future_risks"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_vs_competition_ticker_id_idx" ON "ticker_v1_vs_competition"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_vs_competition_space_id_ticker_id_key" ON "ticker_v1_vs_competition"("space_id", "ticker_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_category_analysis_results" ADD CONSTRAINT "ticker_v1_category_analysis_results_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_analysis_category_factor_results" ADD CONSTRAINT "ticker_v1_analysis_category_factor_results_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_analysis_category_factor_results" ADD CONSTRAINT "ticker_v1_analysis_category_factor_results_analysis_catego_fkey" FOREIGN KEY ("analysis_category_factor_id") REFERENCES "analysis_category_factors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_investor_analysis_results" ADD CONSTRAINT "ticker_v1_investor_analysis_results_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_future_risks" ADD CONSTRAINT "ticker_v1_future_risks_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_vs_competition" ADD CONSTRAINT "ticker_v1_vs_competition_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

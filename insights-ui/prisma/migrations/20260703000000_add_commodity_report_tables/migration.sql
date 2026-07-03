-- Commodities report tables. Mirrors the ETF report shape (anchor row, scored
-- categories, per-factor Pass/Fail, key facts, cached score) for commodities.
-- `category_key` is plain TEXT (no DB enum) so the four category values can
-- evolve without a migration. The `result` column reuses the existing
-- "EvaluationResult" enum (Pass/Fail) already created for the ticker/ETF tables.

-- CreateTable
CREATE TABLE "commodities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commodity_group" TEXT NOT NULL,
    "price_symbol" TEXT,
    "exchange" TEXT,
    "unit" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "summary" TEXT,
    "meta_description" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commodity_key_facts_reports" (
    "id" TEXT NOT NULL,
    "commodity_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "key_facts" TEXT,
    "green_flags" JSONB,
    "red_flags" JSONB,
    "main_uses" JSONB,
    "top_producers" JSONB,
    "ways_to_invest" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodity_key_facts_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commodity_category_analysis_results" (
    "id" TEXT NOT NULL,
    "category_key" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "overall_analysis_details" TEXT NOT NULL,
    "commodity_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodity_category_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commodity_analysis_category_factor_results" (
    "id" TEXT NOT NULL,
    "category_key" TEXT NOT NULL,
    "factor_key" TEXT NOT NULL,
    "one_line_explanation" TEXT NOT NULL,
    "detailed_explanation" TEXT NOT NULL,
    "result" "EvaluationResult" NOT NULL,
    "commodity_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodity_analysis_category_factor_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commodity_cached_scores" (
    "id" TEXT NOT NULL,
    "commodity_id" TEXT NOT NULL,
    "supply_and_demand_score" INTEGER NOT NULL,
    "price_and_value_score" INTEGER NOT NULL,
    "volatility_and_risk_score" INTEGER NOT NULL,
    "future_outlook_score" INTEGER,
    "final_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodity_cached_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commodity_generation_requests" (
    "id" TEXT NOT NULL,
    "commodity_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "regenerate_supply_and_demand" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_price_and_value" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_volatility_and_risk" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_future_outlook" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_key_facts" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_final_summary" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NotStarted',
    "in_progress_step" TEXT,
    "completed_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "failed_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "commodity_generation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commodities_slug_idx" ON "commodities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "commodities_space_id_slug_key" ON "commodities"("space_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "commodity_key_facts_reports_commodity_id_key" ON "commodity_key_facts_reports"("commodity_id");

-- CreateIndex
CREATE INDEX "commodity_category_analysis_results_commodity_id_idx" ON "commodity_category_analysis_results"("commodity_id");

-- CreateIndex
CREATE UNIQUE INDEX "commodity_category_analysis_results_space_id_commodity_id_ca_key" ON "commodity_category_analysis_results"("space_id", "commodity_id", "category_key");

-- CreateIndex
CREATE INDEX "commodity_analysis_category_factor_results_commodity_id_idx" ON "commodity_analysis_category_factor_results"("commodity_id");

-- CreateIndex
CREATE INDEX "commodity_factor_results_by_parent" ON "commodity_analysis_category_factor_results"("space_id", "commodity_id", "category_key");

-- CreateIndex
CREATE UNIQUE INDEX "commodity_analysis_category_factor_results_space_id_commodit_key" ON "commodity_analysis_category_factor_results"("space_id", "commodity_id", "factor_key");

-- CreateIndex
CREATE UNIQUE INDEX "commodity_cached_scores_commodity_id_key" ON "commodity_cached_scores"("commodity_id");

-- CreateIndex
CREATE INDEX "commodity_generation_requests_commodity_id_idx" ON "commodity_generation_requests"("commodity_id");

-- CreateIndex
CREATE INDEX "commodity_generation_requests_status_idx" ON "commodity_generation_requests"("status");

-- AddForeignKey
ALTER TABLE "commodity_key_facts_reports" ADD CONSTRAINT "commodity_key_facts_reports_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commodity_category_analysis_results" ADD CONSTRAINT "commodity_category_analysis_results_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commodity_analysis_category_factor_results" ADD CONSTRAINT "commodity_analysis_category_factor_results_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commodity_analysis_category_factor_results" ADD CONSTRAINT "commodity_analysis_category_factor_results_space_id_commodi_fkey" FOREIGN KEY ("space_id", "commodity_id", "category_key") REFERENCES "commodity_category_analysis_results"("space_id", "commodity_id", "category_key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commodity_cached_scores" ADD CONSTRAINT "commodity_cached_scores_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commodity_generation_requests" ADD CONSTRAINT "commodity_generation_requests_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

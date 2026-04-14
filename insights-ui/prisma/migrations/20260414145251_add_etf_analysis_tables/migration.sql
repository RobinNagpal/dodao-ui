-- CreateEnum
CREATE TYPE "EtfAnalysisCategory" AS ENUM ('PerformanceAndReturns', 'CostEfficiencyAndTeam', 'RiskAnalysis');

-- CreateTable
CREATE TABLE "etf_generation_requests" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "regenerate_performance_and_returns" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_cost_efficiency_and_team" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_risk_analysis" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NotStarted',
    "in_progress_step" TEXT,
    "completed_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "failed_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "last_invocation_time" TIMESTAMP(3),

    CONSTRAINT "etf_generation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etf_category_analysis_results" (
    "id" TEXT NOT NULL,
    "category_key" "EtfAnalysisCategory" NOT NULL,
    "summary" TEXT NOT NULL,
    "overall_analysis_details" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_category_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etf_analysis_category_factor_results" (
    "id" TEXT NOT NULL,
    "category_key" "EtfAnalysisCategory" NOT NULL,
    "factor_key" TEXT NOT NULL,
    "one_line_explanation" TEXT NOT NULL,
    "detailed_explanation" TEXT NOT NULL,
    "result" "EvaluationResult" NOT NULL,
    "etf_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_analysis_category_factor_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etf_cached_scores" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "performance_and_returns_score" INTEGER NOT NULL,
    "cost_efficiency_and_team_score" INTEGER NOT NULL,
    "risk_analysis_score" INTEGER NOT NULL,
    "final_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_cached_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "etf_generation_requests_etf_id_idx" ON "etf_generation_requests"("etf_id");

-- CreateIndex
CREATE INDEX "etf_generation_requests_status_idx" ON "etf_generation_requests"("status");

-- CreateIndex
CREATE INDEX "etf_generation_requests_etf_id_status_idx" ON "etf_generation_requests"("etf_id", "status");

-- CreateIndex
CREATE INDEX "etf_category_analysis_results_etf_id_idx" ON "etf_category_analysis_results"("etf_id");

-- CreateIndex
CREATE UNIQUE INDEX "etf_category_analysis_results_space_id_etf_id_category_key_key" ON "etf_category_analysis_results"("space_id", "etf_id", "category_key");

-- CreateIndex
CREATE INDEX "etf_analysis_category_factor_results_etf_id_idx" ON "etf_analysis_category_factor_results"("etf_id");

-- CreateIndex
CREATE INDEX "etf_factor_results_by_parent" ON "etf_analysis_category_factor_results"("space_id", "etf_id", "category_key");

-- CreateIndex
CREATE UNIQUE INDEX "etf_analysis_category_factor_results_space_id_etf_id_factor_key" ON "etf_analysis_category_factor_results"("space_id", "etf_id", "factor_key");

-- CreateIndex
CREATE INDEX "etf_cached_scores_etf_id_idx" ON "etf_cached_scores"("etf_id");

-- CreateIndex
CREATE UNIQUE INDEX "etf_cached_scores_etf_id_key" ON "etf_cached_scores"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_generation_requests" ADD CONSTRAINT "etf_generation_requests_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etf_category_analysis_results" ADD CONSTRAINT "etf_category_analysis_results_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etf_analysis_category_factor_results" ADD CONSTRAINT "etf_analysis_category_factor_results_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etf_analysis_category_factor_results" ADD CONSTRAINT "etf_analysis_category_factor_results_space_id_etf_id_categ_fkey" FOREIGN KEY ("space_id", "etf_id", "category_key") REFERENCES "etf_category_analysis_results"("space_id", "etf_id", "category_key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etf_cached_scores" ADD CONSTRAINT "etf_cached_scores_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "FormSize" AS ENUM ('xs', 's', 'm', 'l', 'xl');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('Completed', 'Failed', 'InProgress', 'NotStarted');

-- CreateTable
CREATE TABLE "SecForm" (
    "form_name" TEXT NOT NULL,
    "form_description" TEXT NOT NULL,
    "important_items" JSONB NOT NULL,
    "average_page_count" INTEGER NOT NULL,
    "size" "FormSize" NOT NULL,

    CONSTRAINT "SecForm_pkey" PRIMARY KEY ("form_name")
);

-- CreateTable
CREATE TABLE "ticker_reports" (
    "id" TEXT NOT NULL,
    "ticker_key" TEXT NOT NULL,
    "selected_industry_group_id" INTEGER NOT NULL,
    "selected_sector_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_evaluations" (
    "id" TEXT NOT NULL,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "ticker_report_id" TEXT NOT NULL,

    CONSTRAINT "criterion_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "important_metrics" (
    "id" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "criterion_evaluation_id" TEXT,

    CONSTRAINT "important_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_value_items" (
    "id" TEXT NOT NULL,
    "metric_key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "calculation_explanation" TEXT NOT NULL,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "important_metrics_id" TEXT NOT NULL,

    CONSTRAINT "metric_value_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_report_items" (
    "id" TEXT NOT NULL,
    "report_key" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL,
    "output_file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "criterion_evaluation_id" TEXT NOT NULL,

    CONSTRAINT "criterion_report_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_checklist_evaluations" (
    "id" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "criterion_evaluation_id" TEXT,

    CONSTRAINT "performance_checklist_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_checklist_items" (
    "id" TEXT NOT NULL,
    "checklist_item" TEXT NOT NULL,
    "one_liner_explanation" TEXT NOT NULL,
    "information_used" TEXT NOT NULL,
    "detailed_explanation" TEXT NOT NULL,
    "evaluation_logic" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "performance_checklist_evaluation_id" TEXT NOT NULL,

    CONSTRAINT "performance_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_matches_latest_10q" (
    "id" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL,
    "failure_reason" TEXT,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "ticker_report_id" TEXT NOT NULL,

    CONSTRAINT "criterion_matches_latest_10q_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_matches" (
    "id" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "matched_content" TEXT NOT NULL,
    "ticker_key" TEXT NOT NULL,
    "criterion_matches_latest_10q_id" TEXT NOT NULL,

    CONSTRAINT "criterion_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_match_attachments" (
    "id" TEXT NOT NULL,
    "sequence_number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT,
    "url" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "criterion_match_id" TEXT NOT NULL,
    "ticker_key" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,

    CONSTRAINT "criterion_match_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "important_metrics_criterion_evaluation_id_key" ON "important_metrics"("criterion_evaluation_id");

-- CreateIndex
CREATE UNIQUE INDEX "performance_checklist_evaluations_criterion_evaluation_id_key" ON "performance_checklist_evaluations"("criterion_evaluation_id");

-- CreateIndex
CREATE UNIQUE INDEX "criterion_matches_latest_10q_ticker_report_id_key" ON "criterion_matches_latest_10q"("ticker_report_id");

-- AddForeignKey
ALTER TABLE "ticker_reports" ADD CONSTRAINT "ticker_reports_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_evaluations" ADD CONSTRAINT "criterion_evaluations_ticker_report_id_fkey" FOREIGN KEY ("ticker_report_id") REFERENCES "ticker_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_evaluations" ADD CONSTRAINT "criterion_evaluations_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "important_metrics" ADD CONSTRAINT "important_metrics_criterion_evaluation_id_fkey" FOREIGN KEY ("criterion_evaluation_id") REFERENCES "criterion_evaluations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "important_metrics" ADD CONSTRAINT "important_metrics_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_value_items" ADD CONSTRAINT "metric_value_items_important_metrics_id_fkey" FOREIGN KEY ("important_metrics_id") REFERENCES "important_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_value_items" ADD CONSTRAINT "metric_value_items_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_report_items" ADD CONSTRAINT "criterion_report_items_criterion_evaluation_id_fkey" FOREIGN KEY ("criterion_evaluation_id") REFERENCES "criterion_evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_report_items" ADD CONSTRAINT "criterion_report_items_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_checklist_evaluations" ADD CONSTRAINT "performance_checklist_evaluations_criterion_evaluation_id_fkey" FOREIGN KEY ("criterion_evaluation_id") REFERENCES "criterion_evaluations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_checklist_evaluations" ADD CONSTRAINT "performance_checklist_evaluations_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_checklist_items" ADD CONSTRAINT "performance_checklist_items_performance_checklist_evaluati_fkey" FOREIGN KEY ("performance_checklist_evaluation_id") REFERENCES "performance_checklist_evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_checklist_items" ADD CONSTRAINT "performance_checklist_items_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_matches_latest_10q" ADD CONSTRAINT "criterion_matches_latest_10q_ticker_report_id_fkey" FOREIGN KEY ("ticker_report_id") REFERENCES "ticker_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_matches_latest_10q" ADD CONSTRAINT "criterion_matches_latest_10q_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_matches" ADD CONSTRAINT "criterion_matches_criterion_matches_latest_10q_id_fkey" FOREIGN KEY ("criterion_matches_latest_10q_id") REFERENCES "criterion_matches_latest_10q"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_matches" ADD CONSTRAINT "criterion_matches_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_match_attachments" ADD CONSTRAINT "criterion_match_attachments_criterion_match_id_fkey" FOREIGN KEY ("criterion_match_id") REFERENCES "criterion_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

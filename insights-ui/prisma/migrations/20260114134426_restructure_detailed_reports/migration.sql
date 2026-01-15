/*
  Warnings:

  - You are about to drop the `detailed_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `qualitative_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "detailed_reports" DROP CONSTRAINT "detailed_reports_category_id_fkey";

-- DropForeignKey
ALTER TABLE "detailed_reports" DROP CONSTRAINT "detailed_reports_ticker_id_fkey";

-- DropTable
DROP TABLE "detailed_reports";

-- DropTable
DROP TABLE "qualitative_categories";

-- CreateTable
CREATE TABLE "detailed_report_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detailed_report_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_types" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "one_line_summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt_instructions" TEXT NOT NULL,
    "output_schema" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticker_v1_detailed_reports" (
    "id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "analysis_type_id" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticker_v1_detailed_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_types_category_id_idx" ON "analysis_types"("category_id");

-- CreateIndex
CREATE INDEX "ticker_v1_detailed_reports_ticker_id_idx" ON "ticker_v1_detailed_reports"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_detailed_reports_analysis_type_id_idx" ON "ticker_v1_detailed_reports"("analysis_type_id");

-- AddForeignKey
ALTER TABLE "analysis_types" ADD CONSTRAINT "analysis_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "detailed_report_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_detailed_reports" ADD CONSTRAINT "ticker_v1_detailed_reports_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_detailed_reports" ADD CONSTRAINT "ticker_v1_detailed_reports_analysis_type_id_fkey" FOREIGN KEY ("analysis_type_id") REFERENCES "analysis_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

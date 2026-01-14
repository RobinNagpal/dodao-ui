/*
  Warnings:

  - Added the required column `analysis_template_id` to the `detailed_report_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `analysis_template_id` to the `ticker_v1_detailed_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "detailed_report_categories" ADD COLUMN     "analysis_template_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ticker_v1_detailed_reports" ADD COLUMN     "analysis_template_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "analysis_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "detailed_report_categories_analysis_template_id_idx" ON "detailed_report_categories"("analysis_template_id");

-- CreateIndex
CREATE INDEX "ticker_v1_detailed_reports_analysis_template_id_idx" ON "ticker_v1_detailed_reports"("analysis_template_id");

-- AddForeignKey
ALTER TABLE "detailed_report_categories" ADD CONSTRAINT "detailed_report_categories_analysis_template_id_fkey" FOREIGN KEY ("analysis_template_id") REFERENCES "analysis_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_detailed_reports" ADD CONSTRAINT "ticker_v1_detailed_reports_analysis_template_id_fkey" FOREIGN KEY ("analysis_template_id") REFERENCES "analysis_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

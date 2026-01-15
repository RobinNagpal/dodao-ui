/*
  Warnings:

  - You are about to drop the column `one_line_summary` on the `analysis_types` table. All the data in the column will be lost.
  - You are about to drop the column `output_schema` on the `analysis_types` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "analysis_types" DROP CONSTRAINT "analysis_types_category_id_fkey";

-- DropForeignKey
ALTER TABLE "detailed_report_categories" DROP CONSTRAINT "detailed_report_categories_analysis_template_id_fkey";

-- DropForeignKey
ALTER TABLE "ticker_v1_detailed_reports" DROP CONSTRAINT "ticker_v1_detailed_reports_analysis_template_id_fkey";

-- DropForeignKey
ALTER TABLE "ticker_v1_detailed_reports" DROP CONSTRAINT "ticker_v1_detailed_reports_analysis_type_id_fkey";

-- DropForeignKey
ALTER TABLE "ticker_v1_detailed_reports" DROP CONSTRAINT "ticker_v1_detailed_reports_ticker_id_fkey";

-- AlterTable
ALTER TABLE "analysis_types" DROP COLUMN "one_line_summary",
DROP COLUMN "output_schema";

-- AddForeignKey
ALTER TABLE "detailed_report_categories" ADD CONSTRAINT "detailed_report_categories_analysis_template_id_fkey" FOREIGN KEY ("analysis_template_id") REFERENCES "analysis_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_types" ADD CONSTRAINT "analysis_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "detailed_report_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_detailed_reports" ADD CONSTRAINT "ticker_v1_detailed_reports_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_detailed_reports" ADD CONSTRAINT "ticker_v1_detailed_reports_analysis_template_id_fkey" FOREIGN KEY ("analysis_template_id") REFERENCES "analysis_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_detailed_reports" ADD CONSTRAINT "ticker_v1_detailed_reports_analysis_type_id_fkey" FOREIGN KEY ("analysis_type_id") REFERENCES "analysis_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

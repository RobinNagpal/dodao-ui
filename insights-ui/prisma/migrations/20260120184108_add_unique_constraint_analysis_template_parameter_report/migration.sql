/*
  Warnings:

  - A unique constraint covering the columns `[analysis_template_report_id,analysis_template_parameter_id]` on the table `analysis_template_parameter_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "analysis_template_parameter_reports_analysis_template_repor_key" ON "analysis_template_parameter_reports"("analysis_template_report_id", "analysis_template_parameter_id");

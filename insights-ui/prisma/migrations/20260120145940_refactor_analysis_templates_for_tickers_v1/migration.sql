/*
  Warnings:

  - You are about to drop the column `prompt_id` on the `analysis_templates` table. All the data in the column will be lost.
  - You are about to drop the column `prompt_key` on the `analysis_templates` table. All the data in the column will be lost.
  - You are about to drop the `analysis_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detailed_report_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticker_v1_detailed_reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "analysis_templates" DROP CONSTRAINT "analysis_templates_prompt_id_fkey";

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
ALTER TABLE "analysis_templates" DROP COLUMN "prompt_id",
DROP COLUMN "prompt_key";

-- DropTable
DROP TABLE "analysis_types";

-- DropTable
DROP TABLE "detailed_report_categories";

-- DropTable
DROP TABLE "ticker_v1_detailed_reports";

-- CreateTable
CREATE TABLE "analysis_template_categories" (
    "id" TEXT NOT NULL,
    "analysis_template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_template_parameters" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_template_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_template_reports" (
    "id" TEXT NOT NULL,
    "analysis_template_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "prompt_key" TEXT NOT NULL,
    "input_obj" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_template_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_template_parameter_reports" (
    "id" TEXT NOT NULL,
    "analysis_template_parameter_id" TEXT NOT NULL,
    "analysis_template_report_id" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "source_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_template_parameter_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_template_categories_analysis_template_id_idx" ON "analysis_template_categories"("analysis_template_id");

-- CreateIndex
CREATE INDEX "analysis_template_parameters_category_id_idx" ON "analysis_template_parameters"("category_id");

-- CreateIndex
CREATE INDEX "analysis_template_reports_analysis_template_id_idx" ON "analysis_template_reports"("analysis_template_id");

-- CreateIndex
CREATE INDEX "analysis_template_reports_prompt_id_idx" ON "analysis_template_reports"("prompt_id");

-- CreateIndex
CREATE INDEX "analysis_template_parameter_reports_analysis_template_param_idx" ON "analysis_template_parameter_reports"("analysis_template_parameter_id");

-- CreateIndex
CREATE INDEX "analysis_template_parameter_reports_analysis_template_repor_idx" ON "analysis_template_parameter_reports"("analysis_template_report_id");

-- AddForeignKey
ALTER TABLE "analysis_template_categories" ADD CONSTRAINT "analysis_template_categories_analysis_template_id_fkey" FOREIGN KEY ("analysis_template_id") REFERENCES "analysis_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_template_parameters" ADD CONSTRAINT "analysis_template_parameters_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "analysis_template_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_template_reports" ADD CONSTRAINT "analysis_template_reports_analysis_template_id_fkey" FOREIGN KEY ("analysis_template_id") REFERENCES "analysis_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_template_reports" ADD CONSTRAINT "analysis_template_reports_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_template_parameter_reports" ADD CONSTRAINT "analysis_template_parameter_reports_analysis_template_para_fkey" FOREIGN KEY ("analysis_template_parameter_id") REFERENCES "analysis_template_parameters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_template_parameter_reports" ADD CONSTRAINT "analysis_template_parameter_reports_analysis_template_repo_fkey" FOREIGN KEY ("analysis_template_report_id") REFERENCES "analysis_template_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

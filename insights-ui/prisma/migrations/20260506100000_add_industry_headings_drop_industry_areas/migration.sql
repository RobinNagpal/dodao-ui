-- AlterTable
ALTER TABLE "tariff_chapter_reports" ADD COLUMN "industry_headings" JSONB;
ALTER TABLE "tariff_chapter_reports" DROP COLUMN "industry_areas";

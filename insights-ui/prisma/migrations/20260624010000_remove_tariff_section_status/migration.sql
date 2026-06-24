-- Remove per-section generation status tracking from tariff_chapter_reports.
-- The `section_status` column is no longer used: tariff sections are tracked by
-- the presence of their content in the DB (the admin table's Refresh button), so
-- the separate status map is redundant.

-- AlterTable
ALTER TABLE "tariff_chapter_reports" DROP COLUMN "section_status";

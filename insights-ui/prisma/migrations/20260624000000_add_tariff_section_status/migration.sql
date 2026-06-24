-- Add per-section generation status tracking to tariff_chapter_reports.
-- Stores a JSON map keyed by the section's column name, e.g.
--   { "understandIndustry": { "status": "Completed", "updatedAt": "..." } }
-- so the admin "Generate all" flow can run each section asynchronously and
-- poll for completion. Sections are regenerated in place, overwriting their
-- own entry on each attempt. Nullable + no backfill: a missing/absent entry is
-- treated as "NotStarted" by the application.

-- AlterTable
ALTER TABLE "tariff_chapter_reports" ADD COLUMN "section_status" JSONB;

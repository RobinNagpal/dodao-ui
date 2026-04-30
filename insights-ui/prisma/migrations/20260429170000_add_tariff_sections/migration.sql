-- Introduce a normalized "tariff_sections" table and replace the free-text
-- "section" column on "tariff_chapters" with a FK to it.
--
-- This migration runs back-to-back with the previous tariff migration, so
-- the chapter / code tables have no production data yet. We TRUNCATE
-- defensively in case a deployment ingested rows between the two migrations
-- — they will be re-seeded via POST /api/tariff-calculator/sections.

-- CreateTable
CREATE TABLE "tariff_sections" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "roman_numeral" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_sections_space_id_number_key" ON "tariff_sections"("space_id", "number");

-- Clear chapter / code rows so the new NOT NULL FK column can be added
-- safely. Cascade removes any HtsCode rows that reference the chapters.
TRUNCATE TABLE "hts_codes", "tariff_chapters" CASCADE;

-- Drop the old free-text section column and its index.
DROP INDEX "tariff_chapters_section_idx";
ALTER TABLE "tariff_chapters" DROP COLUMN "section";

-- Add the FK column. NOT NULL is safe because we just truncated.
ALTER TABLE "tariff_chapters" ADD COLUMN "section_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tariff_chapters_section_id_idx" ON "tariff_chapters"("section_id");

-- AddForeignKey
ALTER TABLE "tariff_chapters" ADD CONSTRAINT "tariff_chapters_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tariff_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tariff_chapters" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "notes" TEXT,
    "additional_us_notes" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hts_codes" (
    "id" TEXT NOT NULL,
    "hts_number" TEXT,
    "hts_code_10" TEXT,
    "indent" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit_of_quantity" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "general_rate_of_duty" TEXT,
    "special_rate_of_duty" TEXT,
    "column2_rate_of_duty" TEXT,
    "quota_quantity" TEXT,
    "additional_duties" TEXT,
    "chapter_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hts_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_chapters_space_id_number_key" ON "tariff_chapters"("space_id", "number");

-- CreateIndex
CREATE INDEX "tariff_chapters_section_idx" ON "tariff_chapters"("section");

-- CreateIndex
CREATE UNIQUE INDEX "hts_codes_space_id_hts_number_key" ON "hts_codes"("space_id", "hts_number");

-- CreateIndex
CREATE UNIQUE INDEX "hts_codes_space_id_hts_code_10_key" ON "hts_codes"("space_id", "hts_code_10");

-- CreateIndex
CREATE INDEX "hts_codes_chapter_id_sort_order_idx" ON "hts_codes"("chapter_id", "sort_order");

-- CreateIndex
CREATE INDEX "hts_codes_space_id_parent_id_idx" ON "hts_codes"("space_id", "parent_id");

-- AddForeignKey
ALTER TABLE "hts_codes" ADD CONSTRAINT "hts_codes_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "tariff_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hts_codes" ADD CONSTRAINT "hts_codes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hts_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

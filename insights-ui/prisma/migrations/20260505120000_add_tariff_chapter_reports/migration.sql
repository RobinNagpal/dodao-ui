-- CreateTable
CREATE TABLE "tariff_chapter_reports" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "old_url" TEXT NOT NULL,
    "introduction" JSONB NOT NULL,
    "tariff_updates" JSONB NOT NULL,
    "understand_industry" JSONB NOT NULL,
    "industry_areas" JSONB NOT NULL,
    "conclusion" JSONB NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_chapter_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_chapter_reports_space_id_slug_key" ON "tariff_chapter_reports"("space_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_chapter_reports_space_id_chapter_id_key" ON "tariff_chapter_reports"("space_id", "chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_chapter_reports_space_id_old_url_key" ON "tariff_chapter_reports"("space_id", "old_url");

-- AddForeignKey
ALTER TABLE "tariff_chapter_reports" ADD CONSTRAINT "tariff_chapter_reports_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "tariff_chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

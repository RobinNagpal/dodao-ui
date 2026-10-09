-- CreateTable
CREATE TABLE "tariff_chapter99_headings" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "general_rate" TEXT,
    "rate_kind" TEXT NOT NULL,
    "rate_pct" DECIMAL(7,3),
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "except_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note_refs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hts_edition" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_chapter99_headings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_measures" (
    "id" TEXT NOT NULL,
    "measure_key" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "ch99_code" TEXT NOT NULL,
    "rate_kind" TEXT NOT NULL,
    "rate_pct" DECIMAL(7,3),
    "countries_include" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countries_exclude" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverage_include" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverage_exclude" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "replaces_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "hts_edition" TEXT NOT NULL,
    "reviewed_at" DATE NOT NULL,
    "notes" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_measures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_chapter99_headings_space_id_code_key" ON "tariff_chapter99_headings"("space_id", "code");

-- CreateIndex
CREATE INDEX "tariff_measures_space_id_ch99_code_idx" ON "tariff_measures"("space_id", "ch99_code");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_measures_space_id_measure_key_key" ON "tariff_measures"("space_id", "measure_key");


-- Add the per-HTS-line "candidate codes" tables that back the tariff
-- simulator. See schema.prisma "Tariff Candidate Codes" block for the
-- modelling rationale. These tables are net-new — none of the existing
-- tariff_* tables are altered apart from the new HtsCode -> join FK.

-- CreateEnum
CREATE TYPE "TariffCandidateCodeType" AS ENUM ('COMMODITY_CODE', 'SPECIAL_CODE');

-- CreateEnum
CREATE TYPE "TariffCountryScopeType" AS ENUM ('ALL', 'ONLY', 'ALL_EXCEPT');

-- CreateEnum
CREATE TYPE "TariffApplicabilityConditionKind" AS ENUM ('EQUALS', 'GREATER', 'LESS', 'SOME_SPI_APPLIED');

-- CreateEnum
CREATE TYPE "TariffRelatedCodeKind" AS ENUM ('EXCLUDED_BY', 'REPLACES', 'RELATED');

-- CreateTable
CREATE TABLE "tariff_candidate_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "variant" TEXT,
    "type" "TariffCandidateCodeType" NOT NULL,
    "line_description" TEXT NOT NULL,
    "full_description" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3) NOT NULL,
    "rate_description" TEXT NOT NULL,
    "rate_primary" TEXT NOT NULL,
    "rate_secondary" TEXT NOT NULL,
    "rate_other" TEXT NOT NULL,
    "rate_penalty" TEXT NOT NULL,
    "rate_computation_code" TEXT NOT NULL,
    "units_of_measure" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "flags_for_anti_dumping" BOOLEAN NOT NULL DEFAULT false,
    "flags_for_countervailing" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL,
    "requires_user_choice" BOOLEAN NOT NULL DEFAULT false,
    "country_scope_type" "TariffCountryScopeType" NOT NULL,
    "country_scope_countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "label" TEXT NOT NULL DEFAULT '',
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pga_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fee_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parent_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "line_split_field" TEXT,
    "line_split_conditions" JSONB,
    "relates_to_codes_digits" JSONB,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_candidate_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_candidate_codes_space_id_code_variant_key" ON "tariff_candidate_codes"("space_id", "code", "variant");

-- CreateIndex
CREATE INDEX "tariff_candidate_codes_type_category_idx" ON "tariff_candidate_codes"("type", "category");

-- CreateIndex
CREATE INDEX "tariff_candidate_codes_code_idx" ON "tariff_candidate_codes"("code");

-- CreateTable
CREATE TABLE "hts_code_candidate_codes" (
    "id" TEXT NOT NULL,
    "hts_code_id" TEXT NOT NULL,
    "candidate_code_id" TEXT NOT NULL,
    "last_fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hts_code_candidate_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hts_code_candidate_codes_space_id_hts_code_id_candidate_code_id_key" ON "hts_code_candidate_codes"("space_id", "hts_code_id", "candidate_code_id");

-- CreateIndex
CREATE INDEX "hts_code_candidate_codes_candidate_code_id_idx" ON "hts_code_candidate_codes"("candidate_code_id");

-- AddForeignKey
ALTER TABLE "hts_code_candidate_codes" ADD CONSTRAINT "hts_code_candidate_codes_hts_code_id_fkey" FOREIGN KEY ("hts_code_id") REFERENCES "hts_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hts_code_candidate_codes" ADD CONSTRAINT "hts_code_candidate_codes_candidate_code_id_fkey" FOREIGN KEY ("candidate_code_id") REFERENCES "tariff_candidate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tariff_candidate_special_rates" (
    "id" TEXT NOT NULL,
    "candidate_code_id" TEXT NOT NULL,
    "spi" TEXT NOT NULL,
    "rate_description" TEXT NOT NULL,
    "rate_primary" TEXT NOT NULL,
    "rate_secondary" TEXT NOT NULL,
    "rate_other" TEXT NOT NULL,
    "rate_penalty" TEXT NOT NULL,
    "rate_computation_code" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_candidate_special_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tariff_candidate_special_rates_candidate_code_id_sort_order_idx" ON "tariff_candidate_special_rates"("candidate_code_id", "sort_order");

-- AddForeignKey
ALTER TABLE "tariff_candidate_special_rates" ADD CONSTRAINT "tariff_candidate_special_rates_candidate_code_id_fkey" FOREIGN KEY ("candidate_code_id") REFERENCES "tariff_candidate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tariff_candidate_applicability_conditions" (
    "id" TEXT NOT NULL,
    "candidate_code_id" TEXT NOT NULL,
    "kind" "TariffApplicabilityConditionKind" NOT NULL,
    "field_key" TEXT NOT NULL,
    "field_should_equal" TEXT,
    "threshold" TEXT,
    "including_threshold" BOOLEAN,
    "program_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_candidate_applicability_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tariff_candidate_applicability_conditions_candidate_code_id_sort_order_idx" ON "tariff_candidate_applicability_conditions"("candidate_code_id", "sort_order");

-- AddForeignKey
ALTER TABLE "tariff_candidate_applicability_conditions" ADD CONSTRAINT "tariff_candidate_applicability_conditions_candidate_code_id_fkey" FOREIGN KEY ("candidate_code_id") REFERENCES "tariff_candidate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tariff_candidate_related_codes" (
    "id" TEXT NOT NULL,
    "candidate_code_id" TEXT NOT NULL,
    "kind" "TariffRelatedCodeKind" NOT NULL,
    "code" TEXT NOT NULL,
    "variant" TEXT,
    "sort_order" INTEGER NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_candidate_related_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tariff_candidate_related_codes_candidate_code_id_kind_sort_order_idx" ON "tariff_candidate_related_codes"("candidate_code_id", "kind", "sort_order");

-- CreateIndex
CREATE INDEX "tariff_candidate_related_codes_code_variant_idx" ON "tariff_candidate_related_codes"("code", "variant");

-- AddForeignKey
ALTER TABLE "tariff_candidate_related_codes" ADD CONSTRAINT "tariff_candidate_related_codes_candidate_code_id_fkey" FOREIGN KEY ("candidate_code_id") REFERENCES "tariff_candidate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tariff_trade_analytics" (
    "id" TEXT NOT NULL,
    "candidate_code_id" TEXT NOT NULL,
    "analytics_level" TEXT NOT NULL,
    "hts_code_10" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "country_name" TEXT NOT NULL,
    "us_customs_country_code" TEXT NOT NULL,
    "total_customs_value" DECIMAL(20,2) NOT NULL,
    "total_calculated_duty" DECIMAL(20,2) NOT NULL,
    "total_duty_rate" DECIMAL(10,6) NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_trade_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tariff_trade_analytics_candidate_code_id_idx" ON "tariff_trade_analytics"("candidate_code_id");

-- CreateIndex
CREATE INDEX "tariff_trade_analytics_hts_code_10_date_idx" ON "tariff_trade_analytics"("hts_code_10", "date");

-- AddForeignKey
ALTER TABLE "tariff_trade_analytics" ADD CONSTRAINT "tariff_trade_analytics_candidate_code_id_fkey" FOREIGN KEY ("candidate_code_id") REFERENCES "tariff_candidate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tariff_trade_analytic_import_programs" (
    "id" TEXT NOT NULL,
    "trade_analytic_id" TEXT NOT NULL,
    "program_name" TEXT NOT NULL,
    "program_indicator" TEXT NOT NULL,
    "general_note" TEXT NOT NULL,
    "spi_special_program_indicator" TEXT NOT NULL,
    "spi_agreement_name" TEXT NOT NULL,
    "spi_general_note" TEXT NOT NULL,
    "spi_exclude_mpf" BOOLEAN NOT NULL DEFAULT false,
    "countries_of_origin" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "spi_countries_of_origin" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customs_value" DECIMAL(20,2) NOT NULL,
    "calculated_duty" DECIMAL(20,2) NOT NULL,
    "duty_rate" DECIMAL(10,6) NOT NULL,
    "percent_of_line_value" DECIMAL(10,6) NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_trade_analytic_import_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tariff_trade_analytic_import_programs_trade_analytic_id_idx" ON "tariff_trade_analytic_import_programs"("trade_analytic_id");

-- AddForeignKey
ALTER TABLE "tariff_trade_analytic_import_programs" ADD CONSTRAINT "tariff_trade_analytic_import_programs_trade_analytic_id_fkey" FOREIGN KEY ("trade_analytic_id") REFERENCES "tariff_trade_analytics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Re-add the `countries` column on etf_scenarios. The earlier
-- `drop_etf_scenario_countries` migration removed it on the assumption that we
-- would derive country from each link's exchange. We've since reverted to the
-- stock-scenarios pattern: countries are stored on the row, validated against
-- ETF_SUPPORTED_COUNTRIES (US + Canada for now), and links must use an
-- exchange whose country is declared in scenario.countries.
ALTER TABLE "etf_scenarios" ADD COLUMN "countries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- API requires countries.length >= 1, so backfill any pre-existing rows
-- (lost their data when the column was dropped) with US — same default the
-- original add migration used.
UPDATE "etf_scenarios" SET "countries" = ARRAY['US']::TEXT[] WHERE cardinality("countries") = 0;

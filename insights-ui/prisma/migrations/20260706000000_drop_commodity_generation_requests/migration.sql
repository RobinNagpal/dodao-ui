-- Commodities are generated per report type on demand (only ~22 of them), so the
-- generation-request queue table is no longer used. Drop it. Report status is now
-- derived purely from whether each report row exists (mirrors the tariff workflow).

-- DropTable
DROP TABLE IF EXISTS "commodity_generation_requests";

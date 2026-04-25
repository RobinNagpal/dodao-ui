-- Drop the `countries` column on etf_scenarios. We're storing country info
-- only on stocks; for ETFs the country is derived from each link's exchange
-- via the ETF_EXCHANGE_TO_COUNTRY map (see src/utils/etfCountryExchangeUtils.ts).
ALTER TABLE "etf_scenarios" DROP COLUMN IF EXISTS "countries";

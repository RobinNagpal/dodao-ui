-- AlterTable
ALTER TABLE "etf_mor_analyzer_info"
ADD COLUMN "overview_investment_size" TEXT,
ADD COLUMN "overview_mer" TEXT,
ADD COLUMN "overview_risk_level" TEXT,
ADD COLUMN "market_prospectus_benchmark" TEXT,
ADD COLUMN "market_discount" TEXT,
ADD COLUMN "market_premium" TEXT;

-- AlterTable
ALTER TABLE "etf_mor_people_info"
ADD COLUMN "sub_advisors" TEXT;

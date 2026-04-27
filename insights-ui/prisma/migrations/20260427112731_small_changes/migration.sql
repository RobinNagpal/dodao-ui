-- AlterTable
ALTER TABLE "etf_scenarios" ALTER COLUMN "countries" DROP DEFAULT;

-- AlterTable
ALTER TABLE "etf_stock_analyzer_info" ADD COLUMN     "position_in_range" TEXT;

-- AlterTable
ALTER TABLE "ticker_v1_stock_analyzer_scrapper_info" ADD COLUMN     "kpis_annual" JSONB,
ADD COLUMN     "kpis_quarter" JSONB,
ADD COLUMN     "last_updated_at_kpis_annual" TIMESTAMP(3),
ADD COLUMN     "last_updated_at_kpis_quarter" TIMESTAMP(3);

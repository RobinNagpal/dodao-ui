-- AlterTable
ALTER TABLE "TickerV1Industry" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TickerV1SubIndustry" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

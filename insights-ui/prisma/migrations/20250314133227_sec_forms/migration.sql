-- CreateEnum
CREATE TYPE "FormSize" AS ENUM ('xs', 's', 'm', 'l', 'xl');

-- AlterTable
ALTER TABLE "sec_filings" ADD COLUMN     "short_summary" TEXT;

-- CreateTable
CREATE TABLE "SecForm" (
    "form_name" TEXT NOT NULL,
    "form_description" TEXT NOT NULL,
    "important_items" JSONB NOT NULL,
    "average_page_count" INTEGER NOT NULL,
    "size" "FormSize" NOT NULL,

    CONSTRAINT "SecForm_pkey" PRIMARY KEY ("form_name")
);

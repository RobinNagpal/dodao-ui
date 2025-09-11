-- AlterTable
ALTER TABLE "case_studies" ADD COLUMN     "editors" TEXT[] DEFAULT ARRAY[]::TEXT[];

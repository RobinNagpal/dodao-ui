/*
  Warnings:

  - Made the column `created_by` on table `case_studies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `case_studies` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "case_studies" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

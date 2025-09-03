/*
  Warnings:

  - You are about to drop the column `description` on the `analysis_category_factors` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `analysis_category_factors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "analysis_category_factors" DROP COLUMN "description",
DROP COLUMN "name";

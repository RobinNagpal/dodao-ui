/*
  Warnings:

  - You are about to drop the column `analysis_explanation` on the `ticker_v1_analysis_category_factor_results` table. All the data in the column will be lost.
  - Added the required column `detailed_explanation` to the `ticker_v1_analysis_category_factor_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `one_line_explanation` to the `ticker_v1_analysis_category_factor_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticker_v1_analysis_category_factor_results" DROP COLUMN "analysis_explanation",
ADD COLUMN     "detailed_explanation" TEXT NOT NULL,
ADD COLUMN     "one_line_explanation" TEXT NOT NULL;

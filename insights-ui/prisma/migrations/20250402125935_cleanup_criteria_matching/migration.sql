/*
  Warnings:

  - You are about to drop the `criterion_match_attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "criterion_match_attachments" DROP CONSTRAINT "criterion_match_attachments_criterion_match_id_fkey";

-- AlterTable
ALTER TABLE "criteria_matches_latest_10q" ADD COLUMN     "matching_attachments_count" INTEGER,
ADD COLUMN     "matching_attachments_processed_count" INTEGER;

-- DropTable
DROP TABLE "criterion_match_attachments";

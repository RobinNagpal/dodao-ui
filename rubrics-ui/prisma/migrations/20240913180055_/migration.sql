/*
  Warnings:

  - The `status` column on the `rubric_ratings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "rubric_ratings" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'inProgress';

-- DropEnum
DROP TYPE "RatingCellStatus";

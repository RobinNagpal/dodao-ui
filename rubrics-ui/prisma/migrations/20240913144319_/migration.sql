/*
  Warnings:

  - You are about to drop the column `status` on the `rating_cell_selections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rating_cell_selections" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "rubric_ratings" ADD COLUMN     "status" "RatingCellStatus" NOT NULL DEFAULT 'inProgress';

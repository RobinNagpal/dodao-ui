-- CreateEnum
CREATE TYPE "RatingCellStatus" AS ENUM ('inProgress', 'finalized');

-- AlterTable
ALTER TABLE "rating_cell_selections" ADD COLUMN     "status" "RatingCellStatus" NOT NULL DEFAULT 'inProgress';

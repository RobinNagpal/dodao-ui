/*
  Warnings:

  - You are about to drop the column `evaluation_logic` on the `exercise_attempts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "enrollment_students" ALTER COLUMN "final_score" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "exercise_attempts" DROP COLUMN "evaluation_logic",
ADD COLUMN     "evaluation_reasoning" TEXT;

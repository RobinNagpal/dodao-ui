-- AlterTable
ALTER TABLE "enrollment_students" ADD COLUMN     "final_score" INTEGER;

-- AlterTable
ALTER TABLE "exercise_attempts" ADD COLUMN     "evaluated_score" INTEGER,
ADD COLUMN     "evaluation_logic" TEXT;

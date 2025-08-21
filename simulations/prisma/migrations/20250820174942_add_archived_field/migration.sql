-- AlterTable
ALTER TABLE "case_studies" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "case_study_enrollments" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "case_study_modules" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "enrollment_students" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "exercise_attempts" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "final_submissions" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "module_exercises" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

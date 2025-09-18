/*
  Warnings:

  - Made the column `created_by` on table `enrollment_students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `enrollment_students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_by` on table `exercise_attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `exercise_attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_by` on table `final_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `final_submissions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_by` on table `final_summaries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `final_summaries` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "enrollment_students" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

-- AlterTable
ALTER TABLE "exercise_attempts" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

-- AlterTable
ALTER TABLE "final_submissions" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

-- AlterTable
ALTER TABLE "final_summaries" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "enrollment_students" ADD CONSTRAINT "enrollment_students_assigned_student_id_fkey" FOREIGN KEY ("assigned_student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_students" ADD CONSTRAINT "enrollment_students_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_students" ADD CONSTRAINT "enrollment_students_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_summaries" ADD CONSTRAINT "final_summaries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_summaries" ADD CONSTRAINT "final_summaries_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_submissions" ADD CONSTRAINT "final_submissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_submissions" ADD CONSTRAINT "final_submissions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `created_by` on table `case_study_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `case_study_enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_by` on table `case_study_modules` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `case_study_modules` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_by` on table `module_exercises` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_by` on table `module_exercises` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "case_study_enrollments" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

-- AlterTable
ALTER TABLE "case_study_modules" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

-- AlterTable
ALTER TABLE "module_exercises" ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_by" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "case_study_modules" ADD CONSTRAINT "case_study_modules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_modules" ADD CONSTRAINT "case_study_modules_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_enrollments" ADD CONSTRAINT "case_study_enrollments_assigned_instructor_id_fkey" FOREIGN KEY ("assigned_instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_enrollments" ADD CONSTRAINT "case_study_enrollments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_enrollments" ADD CONSTRAINT "case_study_enrollments_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_exercises" ADD CONSTRAINT "module_exercises_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_exercises" ADD CONSTRAINT "module_exercises_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

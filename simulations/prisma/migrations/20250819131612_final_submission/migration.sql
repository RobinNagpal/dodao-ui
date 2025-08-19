/*
  Warnings:

  - You are about to drop the column `case_study_id` on the `final_submissions` table. All the data in the column will be lost.
  - Added the required column `student_id` to the `final_submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "final_submissions" DROP CONSTRAINT "final_submissions_case_study_id_fkey";

-- AlterTable
ALTER TABLE "final_submissions" DROP COLUMN "case_study_id",
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "final_submissions" ADD CONSTRAINT "final_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "enrollment_students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `instruction_read_status` on the `case_study_enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "case_study_enrollments" DROP COLUMN "instruction_read_status";

-- AlterTable
ALTER TABLE "enrollment_students" ADD COLUMN     "instruction_read_status" JSONB;

/*
  Warnings:

  - You are about to drop the column `final_summary_prompt_instructions` on the `case_study_enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "case_studies" ADD COLUMN     "final_summary_prompt_instructions" TEXT;

-- AlterTable
ALTER TABLE "case_study_enrollments" DROP COLUMN "final_summary_prompt_instructions";

-- AlterTable
ALTER TABLE "case_study_enrollments" ADD COLUMN     "instruction_read_status" JSONB;

-- AlterTable
ALTER TABLE "module_exercises" ADD COLUMN     "prompt_hint" TEXT;

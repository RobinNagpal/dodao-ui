-- AlterTable
ALTER TABLE "module_exercises" ADD COLUMN     "prompt_character_limit" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "prompt_output_instructions" TEXT;

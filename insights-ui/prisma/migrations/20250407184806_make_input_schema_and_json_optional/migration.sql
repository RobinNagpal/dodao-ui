-- AlterTable
ALTER TABLE "prompt_invocations" ALTER COLUMN "input_json" DROP NOT NULL;

-- AlterTable
ALTER TABLE "prompts" ALTER COLUMN "input_schema" DROP NOT NULL;

-- AlterTable
ALTER TABLE "analysis_templates" ADD COLUMN     "prompt_id" TEXT,
ADD COLUMN     "prompt_key" TEXT;

-- AlterTable
ALTER TABLE "ticker_v1_detailed_reports" ADD COLUMN     "source_links" JSONB;

-- AddForeignKey
ALTER TABLE "analysis_templates" ADD CONSTRAINT "analysis_templates_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

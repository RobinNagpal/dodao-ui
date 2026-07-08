-- Add optional LLM provider/model override to ticker generation requests.
-- Chosen in the report-generation UI and threaded through the background
-- generation path. Nullable + no backfill: a NULL value means "use the
-- configured (env/provider) defaults" in getLLMResponseForPromptViaInvocationViaLambda.

-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN "llm_provider" TEXT;
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN "llm_model" TEXT;

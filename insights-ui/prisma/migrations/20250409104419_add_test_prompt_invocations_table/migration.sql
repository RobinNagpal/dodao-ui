-- CreateTable
CREATE TABLE "test_prompt_invocations" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "prompt_template" TEXT NOT NULL,
    "input_json" JSONB,
    "body_to_append" TEXT,
    "output_json" JSONB,
    "transformed_json" JSONB,
    "status" "PromptInvocationStatus" NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "llm_provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,

    CONSTRAINT "test_prompt_invocations_pkey" PRIMARY KEY ("id")
);

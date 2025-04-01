-- CreateEnum
CREATE TYPE "PromptInvocationStatus" AS ENUM ('Completed', 'Failed', 'InProgress', 'NotStarted');

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "excerpt" TEXT,
    "input_schema" TEXT,
    "output_schema" TEXT,
    "sample_json" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "active_prompt_version_id" TEXT,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "prompt_template" TEXT NOT NULL,
    "commit_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_invocations" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "prompt_version_id" TEXT NOT NULL,
    "input_json" TEXT NOT NULL,
    "output_json" TEXT NOT NULL,
    "status" "PromptInvocationStatus" NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "prompt_invocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prompts_active_prompt_version_id_key" ON "prompts"("active_prompt_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompts_space_id_key_key" ON "prompts"("space_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_versions_prompt_id_version_key" ON "prompt_versions"("prompt_id", "version");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_active_prompt_version_id_fkey" FOREIGN KEY ("active_prompt_version_id") REFERENCES "prompt_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_invocations" ADD CONSTRAINT "prompt_invocations_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_invocations" ADD CONSTRAINT "prompt_invocations_prompt_version_id_fkey" FOREIGN KEY ("prompt_version_id") REFERENCES "prompt_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

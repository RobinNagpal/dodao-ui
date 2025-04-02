/*
  Warnings:

  - The `output_json` column on the `prompt_invocations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `llm_provider` to the `prompt_invocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `prompt_invocations` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `input_json` on the `prompt_invocations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "prompt_invocations" ADD COLUMN     "body_to_append" TEXT,
ADD COLUMN     "llm_provider" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
DROP COLUMN "input_json",
ADD COLUMN     "input_json" JSONB NOT NULL,
DROP COLUMN "output_json",
ADD COLUMN     "output_json" JSONB;

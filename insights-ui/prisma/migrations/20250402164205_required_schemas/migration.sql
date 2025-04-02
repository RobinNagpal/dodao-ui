/*
  Warnings:

  - Made the column `input_schema` on table `prompts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `output_schema` on table `prompts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "prompts" ALTER COLUMN "input_schema" SET NOT NULL,
ALTER COLUMN "output_schema" SET NOT NULL;

/*
  Warnings:

  - You are about to drop the column `priority` on the `byte_collections` table. All the data in the column will be lost.

*/
-- Add the new `order` column
ALTER TABLE "byte_collections" ADD COLUMN "order" INTEGER DEFAULT 0 NOT NULL;

-- Migrate data from `priority` to `order`
UPDATE "byte_collections" SET "order" = -("priority");

-- AlterTable
ALTER TABLE "byte_collections" DROP COLUMN "priority";

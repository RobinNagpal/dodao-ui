/*
  Warnings:

  - You are about to drop the `guides_guide_steps` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `guide_id` to the `guide_steps` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "guides_guide_steps" DROP CONSTRAINT "guides_guide_steps_guide_id_fkey";

-- DropForeignKey
ALTER TABLE "guides_guide_steps" DROP CONSTRAINT "guides_guide_steps_guide_step_id_fkey";

-- DropForeignKey
ALTER TABLE "guides_guide_steps" DROP CONSTRAINT "guides_guide_steps_space_id_fkey";

-- AlterTable
ALTER TABLE "guide_steps" ADD COLUMN     "guide_id" VARCHAR(66) NOT NULL;

-- DropTable
DROP TABLE "guides_guide_steps";

-- AddForeignKey
ALTER TABLE "guide_steps" ADD CONSTRAINT "guide_steps_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

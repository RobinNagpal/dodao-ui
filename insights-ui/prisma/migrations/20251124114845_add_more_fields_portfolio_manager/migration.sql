/*
  Warnings:

  - Added the required column `country` to the `portfolio_manager_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manager_type` to the `portfolio_manager_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "portfolio_manager_profiles" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manager_type" TEXT NOT NULL,
ADD COLUMN     "profile_image_url" TEXT;

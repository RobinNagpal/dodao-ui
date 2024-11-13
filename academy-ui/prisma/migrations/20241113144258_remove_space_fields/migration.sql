/*
  Warnings:

  - You are about to drop the column `academy_repository` on the `space_integrations` table. All the data in the column will be lost.
  - You are about to drop the column `git_guide_repositories` on the `space_integrations` table. All the data in the column will be lost.
  - You are about to drop the column `gnosis_safe_wallets` on the `space_integrations` table. All the data in the column will be lost.
  - You are about to drop the column `admin_usernames` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `admins` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `botDomains` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `skin` on the `spaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "space_integrations" DROP COLUMN "academy_repository",
DROP COLUMN "git_guide_repositories",
DROP COLUMN "gnosis_safe_wallets";

-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "admin_usernames",
DROP COLUMN "admins",
DROP COLUMN "botDomains",
DROP COLUMN "skin";

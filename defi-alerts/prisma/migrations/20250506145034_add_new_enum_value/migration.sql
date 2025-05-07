/*
  Warnings:

  - The primary key for the `Asset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `LendingAndBorrowingRate` table. All the data in the column will be lost.
  - Added the required column `chainId_address` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetChainId_address` to the `LendingAndBorrowingRate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "NotificationFrequency" ADD VALUE 'ONCE_PER_ALERT';

-- DropForeignKey
ALTER TABLE "LendingAndBorrowingRate" DROP CONSTRAINT "LendingAndBorrowingRate_assetId_fkey";

-- DropForeignKey
ALTER TABLE "_AlertAssets" DROP CONSTRAINT "_AlertAssets_B_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_pkey",
DROP COLUMN "id",
ADD COLUMN     "chainId_address" TEXT NOT NULL,
ADD CONSTRAINT "Asset_pkey" PRIMARY KEY ("chainId_address");

-- AlterTable
ALTER TABLE "LendingAndBorrowingRate" DROP COLUMN "assetId",
ADD COLUMN     "assetChainId_address" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LendingAndBorrowingRate" ADD CONSTRAINT "LendingAndBorrowingRate_assetChainId_address_fkey" FOREIGN KEY ("assetChainId_address") REFERENCES "Asset"("chainId_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertAssets" ADD CONSTRAINT "_AlertAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "Asset"("chainId_address") ON DELETE CASCADE ON UPDATE CASCADE;

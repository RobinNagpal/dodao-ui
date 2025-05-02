/*
  Warnings:

  - You are about to drop the column `selectedAssets` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `selectedChains` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `asset` on the `LendingAndBorrowingRate` table. All the data in the column will be lost.
  - You are about to drop the column `chain` on the `LendingAndBorrowingRate` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `LendingAndBorrowingRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `LendingAndBorrowingRate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "selectedAssets",
DROP COLUMN "selectedChains";

-- AlterTable
ALTER TABLE "LendingAndBorrowingRate" DROP COLUMN "asset",
DROP COLUMN "chain",
ADD COLUMN     "assetId" TEXT NOT NULL,
ADD COLUMN     "chainId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Chain" (
    "chainId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("chainId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlertChains" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlertChains_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AlertAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AlertAssets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AlertChains_B_index" ON "_AlertChains"("B");

-- CreateIndex
CREATE INDEX "_AlertAssets_B_index" ON "_AlertAssets"("B");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LendingAndBorrowingRate" ADD CONSTRAINT "LendingAndBorrowingRate_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LendingAndBorrowingRate" ADD CONSTRAINT "LendingAndBorrowingRate_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertChains" ADD CONSTRAINT "_AlertChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertChains" ADD CONSTRAINT "_AlertChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Chain"("chainId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertAssets" ADD CONSTRAINT "_AlertAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertAssets" ADD CONSTRAINT "_AlertAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

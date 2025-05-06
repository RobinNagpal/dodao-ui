/*
  Warnings:

  - The values [IMMEDIATE] on the enum `NotificationFrequency` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `selectedMarkets` on the `Alert` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationFrequency_new" AS ENUM ('AT_MOST_ONCE_PER_3_HOURS', 'AT_MOST_ONCE_PER_6_HOURS', 'AT_MOST_ONCE_PER_12_HOURS', 'AT_MOST_ONCE_PER_DAY', 'AT_MOST_ONCE_PER_WEEK');
ALTER TABLE "Alert" ALTER COLUMN "notificationFrequency" TYPE "NotificationFrequency_new" USING ("notificationFrequency"::text::"NotificationFrequency_new");
ALTER TYPE "NotificationFrequency" RENAME TO "NotificationFrequency_old";
ALTER TYPE "NotificationFrequency_new" RENAME TO "NotificationFrequency";
DROP TYPE "NotificationFrequency_old";
COMMIT;

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "selectedMarkets",
ADD COLUMN     "selectedAssets" TEXT[];

-- CreateTable
CREATE TABLE "LendingAndBorrowingRate" (
    "id" TEXT NOT NULL,
    "protocolName" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "supplyApr" DOUBLE PRECISION NOT NULL,
    "borrowApr" DOUBLE PRECISION NOT NULL,
    "netEarnAPY" DOUBLE PRECISION NOT NULL,
    "netBorrowAPY" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LendingAndBorrowingRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentNotification" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "alertConditionIds" TEXT[],
    "channelType" "DeliveryChannelType" NOT NULL,
    "destination" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

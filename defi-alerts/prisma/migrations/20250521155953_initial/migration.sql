-- CreateEnum
CREATE TYPE "DeliveryChannelType" AS ENUM ('EMAIL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('ONCE_PER_ALERT', 'AT_MOST_ONCE_PER_3_HOURS', 'AT_MOST_ONCE_PER_6_HOURS', 'AT_MOST_ONCE_PER_12_HOURS', 'AT_MOST_ONCE_PER_DAY', 'AT_MOST_ONCE_PER_WEEK');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('GENERAL', 'PERSONALIZED');

-- CreateEnum
CREATE TYPE "AlertActionType" AS ENUM ('SUPPLY', 'BORROW');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('APR_RISE_ABOVE', 'APR_FALLS_BELOW', 'APR_OUTSIDE_RANGE', 'RATE_DIFF_ABOVE', 'RATE_DIFF_BELOW');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chain" (
    "chainId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("chainId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "chainId_address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("chainId_address")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" "AlertCategory" NOT NULL,
    "actionType" "AlertActionType" NOT NULL,
    "isComparison" BOOLEAN NOT NULL DEFAULT false,
    "walletAddress" TEXT,
    "compareProtocols" TEXT[],
    "notificationFrequency" "NotificationFrequency" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertCondition" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "conditionType" "ConditionType" NOT NULL,
    "thresholdValue" DOUBLE PRECISION,
    "thresholdValueLow" DOUBLE PRECISION,
    "thresholdValueHigh" DOUBLE PRECISION,
    "severity" "SeverityLevel" NOT NULL,

    CONSTRAINT "AlertCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChannel" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "channelType" "DeliveryChannelType" NOT NULL,
    "email" TEXT,
    "webhookUrl" TEXT,

    CONSTRAINT "DeliveryChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LendingAndBorrowingRate" (
    "id" TEXT NOT NULL,
    "protocolName" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "assetChainId_address" TEXT NOT NULL,
    "netEarnAPY" DOUBLE PRECISION NOT NULL,
    "netBorrowAPY" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LendingAndBorrowingRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertNotification" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "alertConditionIds" TEXT[],

    CONSTRAINT "AlertNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentNotification" (
    "id" TEXT NOT NULL,
    "alertNotificationId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlertChains" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AlertAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SentNotification_alertNotificationId_key" ON "SentNotification"("alertNotificationId");

-- CreateIndex
CREATE UNIQUE INDEX "_AlertChains_AB_unique" ON "_AlertChains"("A", "B");

-- CreateIndex
CREATE INDEX "_AlertChains_B_index" ON "_AlertChains"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlertAssets_AB_unique" ON "_AlertAssets"("A", "B");

-- CreateIndex
CREATE INDEX "_AlertAssets_B_index" ON "_AlertAssets"("B");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertCondition" ADD CONSTRAINT "AlertCondition_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChannel" ADD CONSTRAINT "DeliveryChannel_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LendingAndBorrowingRate" ADD CONSTRAINT "LendingAndBorrowingRate_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LendingAndBorrowingRate" ADD CONSTRAINT "LendingAndBorrowingRate_assetChainId_address_fkey" FOREIGN KEY ("assetChainId_address") REFERENCES "Asset"("chainId_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertNotification" ADD CONSTRAINT "AlertNotification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentNotification" ADD CONSTRAINT "SentNotification_alertNotificationId_fkey" FOREIGN KEY ("alertNotificationId") REFERENCES "AlertNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertChains" ADD CONSTRAINT "_AlertChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertChains" ADD CONSTRAINT "_AlertChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Chain"("chainId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertAssets" ADD CONSTRAINT "_AlertAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertAssets" ADD CONSTRAINT "_AlertAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "Asset"("chainId_address") ON DELETE CASCADE ON UPDATE CASCADE;

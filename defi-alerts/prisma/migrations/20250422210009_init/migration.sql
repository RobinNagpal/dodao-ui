-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('ETHEREUM', 'POLYGON', 'ARBITRUM', 'OPTIMISM');

-- CreateEnum
CREATE TYPE "DeliveryChannelType" AS ENUM ('EMAIL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('IMMEDIATE', 'AT_MOST_ONCE_PER_HOUR', 'AT_MOST_ONCE_PER_3_HOURS', 'AT_MOST_ONCE_PER_6_HOURS', 'AT_MOST_ONCE_PER_12_HOURS', 'AT_MOST_ONCE_PER_DAY');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('GENERAL', 'PERSONALIZED');

-- CreateEnum
CREATE TYPE "AlertActionType" AS ENUM ('SUPPLY', 'BORROW', 'LIQUIDITY_PROVISION');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('APR_RISE_ABOVE', 'APR_FALLS_BELOW', 'APR_OUTSIDE_RANGE', 'RATE_DIFF_ABOVE', 'RATE_DIFF_BELOW', 'POSITION_OUT_OF_RANGE', 'POSITION_BACK_IN_RANGE', 'FEES_EARNED_THRESHOLD', 'IMPERMANENT_LOSS_EXCEEDS');

-- CreateEnum
CREATE TYPE "Protocol" AS ENUM ('AAVE', 'MORPHO', 'SPARK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" "AlertCategory" NOT NULL,
    "actionType" "AlertActionType" NOT NULL,
    "isComparison" BOOLEAN NOT NULL DEFAULT false,
    "walletAddress" TEXT,
    "selectedChains" TEXT[],
    "selectedMarkets" TEXT[],
    "compareProtocols" "Protocol"[],
    "notificationFrequency" "NotificationFrequency" NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertCondition" ADD CONSTRAINT "AlertCondition_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChannel" ADD CONSTRAINT "DeliveryChannel_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

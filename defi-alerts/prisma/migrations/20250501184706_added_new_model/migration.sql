/*
  Warnings:

  - You are about to drop the column `alertConditionIds` on the `SentNotification` table. All the data in the column will be lost.
  - You are about to drop the column `alertId` on the `SentNotification` table. All the data in the column will be lost.
  - You are about to drop the column `channelType` on the `SentNotification` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `SentNotification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alertNotificationId]` on the table `SentNotification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alertNotificationId` to the `SentNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SentNotification" DROP COLUMN "alertConditionIds",
DROP COLUMN "alertId",
DROP COLUMN "channelType",
DROP COLUMN "destination",
ADD COLUMN     "alertNotificationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AlertNotification" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "alertConditionIds" TEXT[],

    CONSTRAINT "AlertNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SentNotification_alertNotificationId_key" ON "SentNotification"("alertNotificationId");

-- AddForeignKey
ALTER TABLE "SentNotification" ADD CONSTRAINT "SentNotification_alertNotificationId_fkey" FOREIGN KEY ("alertNotificationId") REFERENCES "AlertNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

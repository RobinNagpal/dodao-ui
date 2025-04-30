/*
  Warnings:

  - The values [AT_MOST_ONCE_PER_HOUR,AT_MOST_ONCE_PER_3_HOURS] on the enum `NotificationFrequency` will be removed. If these variants are still used in the database, this will fail.
  - The `compareProtocols` column on the `Alert` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationFrequency_new" AS ENUM ('IMMEDIATE', 'AT_MOST_ONCE_PER_6_HOURS', 'AT_MOST_ONCE_PER_12_HOURS', 'AT_MOST_ONCE_PER_DAY');
ALTER TABLE "Alert" ALTER COLUMN "notificationFrequency" TYPE "NotificationFrequency_new" USING ("notificationFrequency"::text::"NotificationFrequency_new");
ALTER TYPE "NotificationFrequency" RENAME TO "NotificationFrequency_old";
ALTER TYPE "NotificationFrequency_new" RENAME TO "NotificationFrequency";
DROP TYPE "NotificationFrequency_old";
COMMIT;

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "compareProtocols",
ADD COLUMN     "compareProtocols" TEXT[];

-- DropEnum
DROP TYPE "Chain";

-- DropEnum
DROP TYPE "Protocol";

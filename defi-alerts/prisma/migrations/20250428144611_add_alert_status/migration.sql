/*
  Warnings:

  - The values [LIQUIDITY_PROVISION] on the enum `AlertActionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [POSITION_OUT_OF_RANGE,POSITION_BACK_IN_RANGE,FEES_EARNED_THRESHOLD,IMPERMANENT_LOSS_EXCEEDS] on the enum `ConditionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- AlterEnum
BEGIN;
CREATE TYPE "AlertActionType_new" AS ENUM ('SUPPLY', 'BORROW');
ALTER TABLE "Alert" ALTER COLUMN "actionType" TYPE "AlertActionType_new" USING ("actionType"::text::"AlertActionType_new");
ALTER TYPE "AlertActionType" RENAME TO "AlertActionType_old";
ALTER TYPE "AlertActionType_new" RENAME TO "AlertActionType";
DROP TYPE "AlertActionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ConditionType_new" AS ENUM ('APR_RISE_ABOVE', 'APR_FALLS_BELOW', 'APR_OUTSIDE_RANGE', 'RATE_DIFF_ABOVE', 'RATE_DIFF_BELOW');
ALTER TABLE "AlertCondition" ALTER COLUMN "conditionType" TYPE "ConditionType_new" USING ("conditionType"::text::"ConditionType_new");
ALTER TYPE "ConditionType" RENAME TO "ConditionType_old";
ALTER TYPE "ConditionType_new" RENAME TO "ConditionType";
DROP TYPE "ConditionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE';

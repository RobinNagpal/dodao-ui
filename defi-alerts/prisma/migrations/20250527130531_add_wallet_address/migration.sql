-- AlterTable
ALTER TABLE "users" ADD COLUMN     "wallet_address" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Student', 'Admin', 'Instructor');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'Student';

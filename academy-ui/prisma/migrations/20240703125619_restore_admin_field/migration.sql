-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "admin_usernames" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
ADD COLUMN     "admins" TEXT[];

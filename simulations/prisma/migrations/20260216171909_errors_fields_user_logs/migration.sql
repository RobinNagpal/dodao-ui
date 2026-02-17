/*
  Warnings:

  - The `request_path_params` column on the `user_activity_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `request_query_params` column on the `user_activity_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `request_body` column on the `user_activity_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `response_body` column on the `user_activity_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "user_activity_logs_created_at_idx";

-- DropIndex
DROP INDEX "user_activity_logs_request_method_idx";

-- DropIndex
DROP INDEX "user_activity_logs_request_route_idx";

-- DropIndex
DROP INDEX "user_activity_logs_user_id_created_at_idx";

-- AlterTable
ALTER TABLE "user_activity_logs" ADD COLUMN     "error_details" JSONB,
ADD COLUMN     "error_message" TEXT,
DROP COLUMN "request_path_params",
ADD COLUMN     "request_path_params" JSONB,
DROP COLUMN "request_query_params",
ADD COLUMN     "request_query_params" JSONB,
DROP COLUMN "request_body",
ADD COLUMN     "request_body" JSONB,
DROP COLUMN "response_body",
ADD COLUMN     "response_body" JSONB;

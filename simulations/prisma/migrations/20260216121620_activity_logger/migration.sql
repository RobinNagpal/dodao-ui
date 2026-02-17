-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_route" TEXT NOT NULL,
    "request_method" TEXT NOT NULL,
    "request_path_params" TEXT,
    "request_query_params" TEXT,
    "request_body" TEXT,
    "response_body" TEXT,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activity_logs_user_id_idx" ON "user_activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "user_activity_logs_request_route_idx" ON "user_activity_logs"("request_route");

-- CreateIndex
CREATE INDEX "user_activity_logs_request_method_idx" ON "user_activity_logs"("request_method");

-- CreateIndex
CREATE INDEX "user_activity_logs_status_idx" ON "user_activity_logs"("status");

-- CreateIndex
CREATE INDEX "user_activity_logs_created_at_idx" ON "user_activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "user_activity_logs_user_id_created_at_idx" ON "user_activity_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

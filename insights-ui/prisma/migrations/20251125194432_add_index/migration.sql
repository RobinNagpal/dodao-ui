-- CreateIndex
CREATE INDEX "ticker_v1_generation_requests_ticker_id_status_idx" ON "ticker_v1_generation_requests"("ticker_id", "status");

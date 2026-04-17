-- CreateTable
CREATE TABLE "etf_price_history" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "daily_data" JSONB NOT NULL,
    "last_updated_at_daily" TIMESTAMP(3) NOT NULL,
    "weekly_data" JSONB NOT NULL,
    "last_updated_at_weekly" TIMESTAMP(3) NOT NULL,
    "currency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_price_history_etf_id_key" ON "etf_price_history"("etf_id");

-- CreateIndex
CREATE INDEX "etf_price_history_etf_id_idx" ON "etf_price_history"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_price_history" ADD CONSTRAINT "etf_price_history_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

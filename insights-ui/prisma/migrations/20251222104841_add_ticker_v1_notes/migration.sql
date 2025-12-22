-- CreateTable
CREATE TABLE "ticker_v1_notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "ticker_v1_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticker_v1_notes_user_id_idx" ON "ticker_v1_notes"("user_id");

-- CreateIndex
CREATE INDEX "ticker_v1_notes_ticker_id_idx" ON "ticker_v1_notes"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_notes_space_id_user_id_ticker_id_key" ON "ticker_v1_notes"("space_id", "user_id", "ticker_id");

-- CreateIndex
CREATE INDEX "industry_building_block_analysis_building_block_key_idx" ON "industry_building_block_analysis"("building_block_key");

-- AddForeignKey
ALTER TABLE "ticker_v1_notes" ADD CONSTRAINT "ticker_v1_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_notes" ADD CONSTRAINT "ticker_v1_notes_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

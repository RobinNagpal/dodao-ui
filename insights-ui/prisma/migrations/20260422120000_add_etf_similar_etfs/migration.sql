-- CreateTable
CREATE TABLE "etf_similar_etfs" (
    "id" TEXT NOT NULL,
    "source_etf_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "name" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_similar_etfs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "etf_similar_etfs_source_etf_id_idx" ON "etf_similar_etfs"("source_etf_id");

-- CreateIndex
CREATE UNIQUE INDEX "etf_similar_etfs_source_etf_id_symbol_exchange_key" ON "etf_similar_etfs"("source_etf_id", "symbol", "exchange");

-- AddForeignKey
ALTER TABLE "etf_similar_etfs" ADD CONSTRAINT "etf_similar_etfs_source_etf_id_fkey" FOREIGN KEY ("source_etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

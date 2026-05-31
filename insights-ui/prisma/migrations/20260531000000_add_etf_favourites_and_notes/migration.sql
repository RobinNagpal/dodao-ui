-- Add per-user ETF favourites and ETF notes, mirroring the existing
-- favourite_tickers / ticker_v1_notes tables but keyed on etfs(id).

-- CreateTable
CREATE TABLE "favourite_etfs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "my_notes" TEXT,
    "my_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "favourite_etfs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etf_notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "etf_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favourite_etfs_user_id_idx" ON "favourite_etfs"("user_id");

-- CreateIndex
CREATE INDEX "favourite_etfs_etf_id_idx" ON "favourite_etfs"("etf_id");

-- CreateIndex
CREATE UNIQUE INDEX "favourite_etfs_space_id_user_id_etf_id_key" ON "favourite_etfs"("space_id", "user_id", "etf_id");

-- CreateIndex
CREATE INDEX "etf_notes_user_id_idx" ON "etf_notes"("user_id");

-- CreateIndex
CREATE INDEX "etf_notes_etf_id_idx" ON "etf_notes"("etf_id");

-- CreateIndex
CREATE UNIQUE INDEX "etf_notes_space_id_user_id_etf_id_key" ON "etf_notes"("space_id", "user_id", "etf_id");

-- AddForeignKey
ALTER TABLE "favourite_etfs" ADD CONSTRAINT "favourite_etfs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_etfs" ADD CONSTRAINT "favourite_etfs_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etf_notes" ADD CONSTRAINT "etf_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etf_notes" ADD CONSTRAINT "etf_notes_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "user_ticker_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color_hex" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "user_ticker_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ticker_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "user_ticker_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourite_tickers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "my_notes" TEXT,
    "my_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "favourite_tickers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FavouriteTickerToUserTickerTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FavouriteTickerToUserTickerList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "user_ticker_tags_user_id_idx" ON "user_ticker_tags"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_ticker_tags_space_id_user_id_name_key" ON "user_ticker_tags"("space_id", "user_id", "name");

-- CreateIndex
CREATE INDEX "user_ticker_lists_user_id_idx" ON "user_ticker_lists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_ticker_lists_space_id_user_id_name_key" ON "user_ticker_lists"("space_id", "user_id", "name");

-- CreateIndex
CREATE INDEX "favourite_tickers_user_id_idx" ON "favourite_tickers"("user_id");

-- CreateIndex
CREATE INDEX "favourite_tickers_ticker_id_idx" ON "favourite_tickers"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "favourite_tickers_space_id_user_id_ticker_id_key" ON "favourite_tickers"("space_id", "user_id", "ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "_FavouriteTickerToUserTickerTag_AB_unique" ON "_FavouriteTickerToUserTickerTag"("A", "B");

-- CreateIndex
CREATE INDEX "_FavouriteTickerToUserTickerTag_B_index" ON "_FavouriteTickerToUserTickerTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FavouriteTickerToUserTickerList_AB_unique" ON "_FavouriteTickerToUserTickerList"("A", "B");

-- CreateIndex
CREATE INDEX "_FavouriteTickerToUserTickerList_B_index" ON "_FavouriteTickerToUserTickerList"("B");

-- AddForeignKey
ALTER TABLE "user_ticker_tags" ADD CONSTRAINT "user_ticker_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ticker_lists" ADD CONSTRAINT "user_ticker_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_tickers" ADD CONSTRAINT "favourite_tickers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_tickers" ADD CONSTRAINT "favourite_tickers_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavouriteTickerToUserTickerTag" ADD CONSTRAINT "_FavouriteTickerToUserTickerTag_A_fkey" FOREIGN KEY ("A") REFERENCES "favourite_tickers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavouriteTickerToUserTickerTag" ADD CONSTRAINT "_FavouriteTickerToUserTickerTag_B_fkey" FOREIGN KEY ("B") REFERENCES "user_ticker_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavouriteTickerToUserTickerList" ADD CONSTRAINT "_FavouriteTickerToUserTickerList_A_fkey" FOREIGN KEY ("A") REFERENCES "favourite_tickers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavouriteTickerToUserTickerList" ADD CONSTRAINT "_FavouriteTickerToUserTickerList_B_fkey" FOREIGN KEY ("B") REFERENCES "user_ticker_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

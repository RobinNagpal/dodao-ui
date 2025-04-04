-- CreateTable
CREATE TABLE "latest_10q_info" (
    "id" TEXT NOT NULL,
    "reporting_period" TEXT NOT NULL,
    "sec_filling_url" TEXT NOT NULL,

    CONSTRAINT "latest_10q_info_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tickers" ADD CONSTRAINT "tickers_id_fkey" FOREIGN KEY ("id") REFERENCES "latest_10q_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

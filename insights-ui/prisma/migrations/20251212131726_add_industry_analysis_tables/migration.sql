-- CreateTable
CREATE TABLE "ticker_v1_industry_analysis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry_key" TEXT NOT NULL,
    "meta_description" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticker_v1_industry_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticker_v1_sub_industry_analysis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sub_industry_analysis_key" TEXT NOT NULL,
    "ticker_v1_industry_analysis_id" TEXT NOT NULL,
    "meta_description" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticker_v1_sub_industry_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticker_v1_industry_analysis_industry_key_idx" ON "ticker_v1_industry_analysis"("industry_key");

-- CreateIndex
CREATE INDEX "ticker_v1_sub_industry_analysis_ticker_v1_industry_analysis_idx" ON "ticker_v1_sub_industry_analysis"("ticker_v1_industry_analysis_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_industry_analysis" ADD CONSTRAINT "ticker_v1_industry_analysis_industry_key_fkey" FOREIGN KEY ("industry_key") REFERENCES "TickerV1Industry"("industry_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_sub_industry_analysis" ADD CONSTRAINT "ticker_v1_sub_industry_analysis_ticker_v1_industry_analysi_fkey" FOREIGN KEY ("ticker_v1_industry_analysis_id") REFERENCES "ticker_v1_industry_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

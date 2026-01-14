-- CreateTable
CREATE TABLE "qualitative_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qualitative_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detailed_reports" (
    "id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "analysis_type" TEXT NOT NULL,
    "analysis_point" TEXT NOT NULL,
    "one_line_summary" TEXT NOT NULL,
    "detailed_explanation" TEXT NOT NULL,
    "prompt_instructions" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "output_schema" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detailed_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "detailed_reports_ticker_id_idx" ON "detailed_reports"("ticker_id");

-- CreateIndex
CREATE INDEX "detailed_reports_category_id_idx" ON "detailed_reports"("category_id");

-- AddForeignKey
ALTER TABLE "detailed_reports" ADD CONSTRAINT "detailed_reports_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detailed_reports" ADD CONSTRAINT "detailed_reports_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "qualitative_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

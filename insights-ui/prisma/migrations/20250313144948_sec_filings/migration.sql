-- CreateTable
CREATE TABLE "sec_filings" (
    "id" TEXT NOT NULL,
    "ticker_key" TEXT NOT NULL,
    "filing_date" TIMESTAMP(3) NOT NULL,
    "form" TEXT NOT NULL,
    "filing_url" TEXT NOT NULL,
    "accession_number" TEXT NOT NULL,
    "period_of_report" TEXT NOT NULL,

    CONSTRAINT "sec_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sec_filing_attachments" (
    "id" TEXT NOT NULL,
    "sequence_number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT,
    "url" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "sec_filing_id" TEXT NOT NULL,

    CONSTRAINT "sec_filing_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sec_filings_accession_number_key" ON "sec_filings"("accession_number");

-- AddForeignKey
ALTER TABLE "sec_filings" ADD CONSTRAINT "sec_filings_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sec_filing_attachments" ADD CONSTRAINT "sec_filing_attachments_sec_filing_id_fkey" FOREIGN KEY ("sec_filing_id") REFERENCES "sec_filings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

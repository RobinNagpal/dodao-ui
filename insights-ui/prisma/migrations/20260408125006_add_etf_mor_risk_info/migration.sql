-- CreateTable
CREATE TABLE "etf_mor_risk_info" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "risk_periods" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_mor_risk_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_mor_risk_info_etf_id_key" ON "etf_mor_risk_info"("etf_id");

-- CreateIndex
CREATE INDEX "etf_mor_risk_info_etf_id_idx" ON "etf_mor_risk_info"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_mor_risk_info" ADD CONSTRAINT "etf_mor_risk_info_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

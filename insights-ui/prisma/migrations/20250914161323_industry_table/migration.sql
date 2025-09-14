-- CreateTable
CREATE TABLE "TickerV1Industry" (
    "industry_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "TickerV1Industry_pkey" PRIMARY KEY ("industry_key")
);

-- CreateTable
CREATE TABLE "TickerV1SubIndustry" (
    "sub_industry_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "industry_key" TEXT NOT NULL,

    CONSTRAINT "TickerV1SubIndustry_pkey" PRIMARY KEY ("sub_industry_key")
);

-- AddForeignKey
ALTER TABLE "TickerV1SubIndustry" ADD CONSTRAINT "TickerV1SubIndustry_industry_key_fkey" FOREIGN KEY ("industry_key") REFERENCES "TickerV1Industry"("industry_key") ON DELETE RESTRICT ON UPDATE CASCADE;

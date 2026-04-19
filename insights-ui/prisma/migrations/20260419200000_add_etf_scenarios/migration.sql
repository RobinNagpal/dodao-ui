-- CreateTable
CREATE TABLE "etf_scenarios" (
    "id" TEXT NOT NULL,
    "scenario_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "underlying_cause" TEXT NOT NULL,
    "historical_analog" TEXT NOT NULL,
    "winners_markdown" TEXT NOT NULL,
    "losers_markdown" TEXT NOT NULL,
    "outlook_markdown" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'DOWNSIDE',
    "timeframe" TEXT NOT NULL DEFAULT 'FUTURE',
    "probability_bucket" TEXT NOT NULL DEFAULT 'MEDIUM',
    "probability_percentage" INTEGER,
    "outlook_as_of_date" DATE NOT NULL,
    "meta_description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etf_scenario_etf_links" (
    "id" TEXT NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "etf_id" TEXT,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT,
    "role" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_scenario_etf_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_scenarios_space_id_scenario_number_key" ON "etf_scenarios"("space_id", "scenario_number");

-- CreateIndex
CREATE UNIQUE INDEX "etf_scenarios_space_id_slug_key" ON "etf_scenarios"("space_id", "slug");

-- CreateIndex
CREATE INDEX "etf_scenarios_space_id_archived_idx" ON "etf_scenarios"("space_id", "archived");

-- CreateIndex
CREATE INDEX "etf_scenarios_space_id_direction_idx" ON "etf_scenarios"("space_id", "direction");

-- CreateIndex
CREATE INDEX "etf_scenarios_space_id_timeframe_idx" ON "etf_scenarios"("space_id", "timeframe");

-- CreateIndex
CREATE INDEX "etf_scenarios_space_id_probability_bucket_idx" ON "etf_scenarios"("space_id", "probability_bucket");

-- CreateIndex
CREATE INDEX "etf_scenario_etf_links_scenario_id_idx" ON "etf_scenario_etf_links"("scenario_id");

-- CreateIndex
CREATE INDEX "etf_scenario_etf_links_symbol_idx" ON "etf_scenario_etf_links"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "etf_scenario_etf_links_scenario_id_symbol_role_key" ON "etf_scenario_etf_links"("scenario_id", "symbol", "role");

-- AddForeignKey
ALTER TABLE "etf_scenario_etf_links" ADD CONSTRAINT "etf_scenario_etf_links_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "etf_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

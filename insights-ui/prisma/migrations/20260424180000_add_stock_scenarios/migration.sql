-- CreateTable
CREATE TABLE "stock_scenarios" (
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
    "priced_in_bucket" TEXT NOT NULL DEFAULT 'PARTIALLY_PRICED_IN',
    "expected_price_change" INTEGER,
    "expected_price_change_explanation" TEXT,
    "price_change_timeframe_explanation" TEXT,
    "countries" TEXT[],
    "outlook_as_of_date" DATE NOT NULL,
    "meta_description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_scenario_stock_links" (
    "id" TEXT NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "ticker_id" TEXT,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "role_explanation" TEXT,
    "expected_price_change" INTEGER,
    "expected_price_change_explanation" TEXT,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_scenario_stock_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_scenarios_space_id_scenario_number_key" ON "stock_scenarios"("space_id", "scenario_number");

-- CreateIndex
CREATE UNIQUE INDEX "stock_scenarios_space_id_slug_key" ON "stock_scenarios"("space_id", "slug");

-- CreateIndex
CREATE INDEX "stock_scenarios_space_id_archived_idx" ON "stock_scenarios"("space_id", "archived");

-- CreateIndex
CREATE INDEX "stock_scenarios_space_id_direction_idx" ON "stock_scenarios"("space_id", "direction");

-- CreateIndex
CREATE INDEX "stock_scenarios_space_id_timeframe_idx" ON "stock_scenarios"("space_id", "timeframe");

-- CreateIndex
CREATE INDEX "stock_scenarios_space_id_probability_bucket_idx" ON "stock_scenarios"("space_id", "probability_bucket");

-- CreateIndex
CREATE INDEX "stock_scenarios_space_id_priced_in_bucket_idx" ON "stock_scenarios"("space_id", "priced_in_bucket");

-- CreateIndex
CREATE INDEX "stock_scenario_stock_links_scenario_id_idx" ON "stock_scenario_stock_links"("scenario_id");

-- CreateIndex
CREATE INDEX "stock_scenario_stock_links_symbol_idx" ON "stock_scenario_stock_links"("symbol");

-- CreateIndex
CREATE INDEX "stock_scenario_stock_links_symbol_exchange_idx" ON "stock_scenario_stock_links"("symbol", "exchange");

-- CreateIndex
CREATE UNIQUE INDEX "stock_scenario_stock_links_scenario_id_symbol_exchange_role_key" ON "stock_scenario_stock_links"("scenario_id", "symbol", "exchange", "role");

-- AddForeignKey
ALTER TABLE "stock_scenario_stock_links" ADD CONSTRAINT "stock_scenario_stock_links_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "stock_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticker_v1_analysis_category_factor_results" ADD CONSTRAINT "ticker_v1_analysis_category_factor_results_space_id_ticker_fkey" FOREIGN KEY ("space_id", "ticker_id", "category_key") REFERENCES "ticker_v1_category_analysis_results"("space_id", "ticker_id", "category_key") ON DELETE CASCADE ON UPDATE CASCADE;

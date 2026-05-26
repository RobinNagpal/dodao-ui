-- Rename the admin-managed ETF prompt row from the old "index-strategy" key to
-- "key-facts" so key-facts report generation can resolve its prompt + schemas.
-- Idempotent: a no-op if the row was already renamed (or does not exist).
UPDATE "prompts"
SET "key" = 'US/etfs/key-facts',
    "input_schema" = 'etf-analysis/inputs/key-facts-input.schema.yaml',
    "output_schema" = 'etf-analysis/outputs/key-facts-output.schema.yaml'
WHERE "key" = 'US/etfs/index-strategy';

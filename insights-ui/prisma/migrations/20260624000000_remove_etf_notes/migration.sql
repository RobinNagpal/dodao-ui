-- Remove per-user ETF notes. The dedicated EtfNote model and its API/UI have
-- been removed; favourite_etfs (with its optional my_notes field) is unaffected.

-- DropForeignKey
ALTER TABLE "etf_notes" DROP CONSTRAINT IF EXISTS "etf_notes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "etf_notes" DROP CONSTRAINT IF EXISTS "etf_notes_etf_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "etf_notes";

-- AlterTable
ALTER TABLE "byte_collections_items_mappings" ADD COLUMN     "archive" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "bytes" ADD COLUMN     "archive" BOOLEAN DEFAULT false;

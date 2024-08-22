/*
  Warnings:

  - A unique constraint covering the columns `[byte_collection_id,itemId]` on the table `byte_collections_items_mappings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "byte_collections_items_mappings_byte_collection_id_itemId_key" ON "byte_collections_items_mappings"("byte_collection_id", "itemId");

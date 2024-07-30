-- DropForeignKey
ALTER TABLE "byte_collections_items_mappings" DROP CONSTRAINT "FK_Byte";

-- DropForeignKey
ALTER TABLE "byte_collections_items_mappings" DROP CONSTRAINT "FK_ClickableDemos";

-- CreateTable
CREATE TABLE "_ByteToByteCollectionItemMappings" (
    "A" VARCHAR(255) NOT NULL,
    "B" VARCHAR(64) NOT NULL
);

-- CreateTable
CREATE TABLE "_ByteCollectionItemMappingsToClickableDemos" (
    "A" VARCHAR(64) NOT NULL,
    "B" VARCHAR(255) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ByteToByteCollectionItemMappings_AB_unique" ON "_ByteToByteCollectionItemMappings"("A", "B");

-- CreateIndex
CREATE INDEX "_ByteToByteCollectionItemMappings_B_index" ON "_ByteToByteCollectionItemMappings"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ByteCollectionItemMappingsToClickableDemos_AB_unique" ON "_ByteCollectionItemMappingsToClickableDemos"("A", "B");

-- CreateIndex
CREATE INDEX "_ByteCollectionItemMappingsToClickableDemos_B_index" ON "_ByteCollectionItemMappingsToClickableDemos"("B");

-- AddForeignKey
ALTER TABLE "_ByteToByteCollectionItemMappings" ADD CONSTRAINT "_ByteToByteCollectionItemMappings_A_fkey" FOREIGN KEY ("A") REFERENCES "bytes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ByteToByteCollectionItemMappings" ADD CONSTRAINT "_ByteToByteCollectionItemMappings_B_fkey" FOREIGN KEY ("B") REFERENCES "byte_collections_items_mappings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ByteCollectionItemMappingsToClickableDemos" ADD CONSTRAINT "_ByteCollectionItemMappingsToClickableDemos_A_fkey" FOREIGN KEY ("A") REFERENCES "byte_collections_items_mappings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ByteCollectionItemMappingsToClickableDemos" ADD CONSTRAINT "_ByteCollectionItemMappingsToClickableDemos_B_fkey" FOREIGN KEY ("B") REFERENCES "clickable_demos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

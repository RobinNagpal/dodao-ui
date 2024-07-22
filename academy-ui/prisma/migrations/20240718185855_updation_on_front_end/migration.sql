-- CreateTable
CREATE TABLE "byte_collections_items_mappings" (
    "id" VARCHAR(64) NOT NULL,
    "byte_collection_id" TEXT NOT NULL,
    "itemId" VARCHAR(64) NOT NULL,
    "itemType" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "byte_collections_items_mappings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "byte_collections_items_mappings" ADD CONSTRAINT "FK_ByteCollection" FOREIGN KEY ("byte_collection_id") REFERENCES "byte_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "byte_collections_items_mappings" ADD CONSTRAINT "FK_Byte" FOREIGN KEY ("itemId") REFERENCES "bytes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

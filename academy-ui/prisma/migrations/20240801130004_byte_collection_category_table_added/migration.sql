-- CreateTable
CREATE TABLE "byte_collection_categories" (
    "id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "excerpt" VARCHAR(255) NOT NULL,
    "image_url" VARCHAR(1024),
    "byte_collection_ids" VARCHAR(255)[],
    "creator" VARCHAR(64) NOT NULL,
    "space_id" VARCHAR(66) NOT NULL,
    "status" VARCHAR(255) NOT NULL DEFAULT 'Active',
    "priority" INTEGER NOT NULL DEFAULT 50,
    "archive" BOOLEAN DEFAULT false,

    CONSTRAINT "byte_collection_categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "byte_collection_categories" ADD CONSTRAINT "byte_collection_categories_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "byte_collections" (
    "id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "byte_ids" VARCHAR(255)[],
    "status" VARCHAR(255) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "video_url" VARCHAR(1024),

    CONSTRAINT "byte_collections_pkey" PRIMARY KEY ("id")
);

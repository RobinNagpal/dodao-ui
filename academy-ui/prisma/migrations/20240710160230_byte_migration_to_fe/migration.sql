-- CreateTable
CREATE TABLE "bytes" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created" VARCHAR(255) NOT NULL,
    "admins" TEXT[],
    "tags" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 50,
    "steps" JSONB[],
    "space_id" VARCHAR(255) NOT NULL,
    "video_url" VARCHAR(1024),
    "video_aspect_ratio" VARCHAR(255),
    "byte_style" VARCHAR(255) DEFAULT 'CardAndCircleProgress',
    "completion_screen" JSON,

    CONSTRAINT "bytes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bytes_id_key" ON "bytes"("id");

-- AddForeignKey
ALTER TABLE "bytes" ADD CONSTRAINT "bytes_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

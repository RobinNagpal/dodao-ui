-- CreateTable
CREATE TABLE "short_videos" (
    "id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(64) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "video_url" VARCHAR(1024) NOT NULL,
    "thumbnail" VARCHAR(1024) NOT NULL,
    "archive" BOOLEAN DEFAULT false,

    CONSTRAINT "short_videos_pkey" PRIMARY KEY ("id")
);

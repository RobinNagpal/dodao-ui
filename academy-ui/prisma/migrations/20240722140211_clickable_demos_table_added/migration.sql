-- CreateTable
CREATE TABLE "clickable_demos" (
    "id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" VARCHAR(256) NOT NULL,
    "steps" JSONB[],
    "archive" BOOLEAN DEFAULT false,

    CONSTRAINT "clickable_demos_pkey" PRIMARY KEY ("id")
);

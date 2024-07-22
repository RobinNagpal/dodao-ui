-- AlterTable
ALTER TABLE "guides" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "guide_submissions" (
    "id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64) NOT NULL,
    "created_by_username" VARCHAR(128) NOT NULL,
    "guide_id" VARCHAR(64) NOT NULL,
    "guide_uuid" VARCHAR(255) NOT NULL,
    "result" JSON NOT NULL,
    "space_id" VARCHAR(64) NOT NULL,
    "steps" JSON NOT NULL,
    "uuid" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(64),
    "correct_questions_count" INTEGER NOT NULL,

    CONSTRAINT "guide_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_ratings" (
    "rating_uuid" VARCHAR(255) NOT NULL,
    "guide_uuid" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "ip_address" VARCHAR(64),
    "skip_start_rating" BOOLEAN,
    "skip_end_rating" BOOLEAN,
    "start_rating" INTEGER,
    "end_rating" INTEGER,
    "positive_feedback" JSON,
    "negative_feedback" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "username" VARCHAR(1024),
    "suggestion" VARCHAR(1024),

    CONSTRAINT "guide_ratings_pkey" PRIMARY KEY ("rating_uuid")
);

-- AddForeignKey
ALTER TABLE "guide_submissions" ADD CONSTRAINT "guide_submissions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

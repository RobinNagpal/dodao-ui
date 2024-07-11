-- CreateTable
CREATE TABLE "byte_ratings" (
    "rating_uuid" VARCHAR(255) NOT NULL,
    "byte_id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "ip_address" VARCHAR(64),
    "skip_rating" BOOLEAN,
    "rating" INTEGER,
    "positive_feedback" JSON,
    "negative_feedback" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "username" VARCHAR(1024),
    "suggestion" VARCHAR(1024),

    CONSTRAINT "byte_ratings_pkey" PRIMARY KEY ("rating_uuid")
);

-- CreateTable
CREATE TABLE "byte_social_shares" (
    "uuid" VARCHAR(255) NOT NULL,
    "byte_id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(255) NOT NULL,
    "linkedin_pdf_content" JSON,
    "linked_in_images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linked_in_pdf" VARCHAR(1024),
    "twitter_image" VARCHAR(1024),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(256),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(256),

    CONSTRAINT "byte_social_shares_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "byte_submissions" (
    "id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64) NOT NULL,
    "byte_id" VARCHAR(64) NOT NULL,
    "space_id" VARCHAR(64) NOT NULL,
    "ip_address" VARCHAR(64),

    CONSTRAINT "byte_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "byte_social_shares_byte_id_key" ON "byte_social_shares"("byte_id");

-- CreateIndex
CREATE UNIQUE INDEX "byte_social_shares_byte_id_space_id_key" ON "byte_social_shares"("byte_id", "space_id");

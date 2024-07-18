-- CreateTable
CREATE TABLE "guides" (
    "id" VARCHAR(66) NOT NULL,
    "content" TEXT NOT NULL,
    "previous_id" VARCHAR(66),
    "uuid" VARCHAR(255) NOT NULL,
    "authors" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "space_id" VARCHAR(64) NOT NULL,
    "guide_name" VARCHAR(255) NOT NULL,
    "guide_source" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL,
    "thumbnail" VARCHAR(255),
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "discord_webhook" VARCHAR(1024),
    "guide_type" VARCHAR(128) NOT NULL DEFAULT 'onboarding',
    "publish_status" VARCHAR(128) NOT NULL DEFAULT 'Live',
    "social_share_image" VARCHAR(2048),
    "discord_role_ids" JSONB NOT NULL,
    "discord_role_passing_count" INTEGER,
    "show_incorrect_on_completion" BOOLEAN NOT NULL DEFAULT true,
    "post_submission_step_content" TEXT NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_steps" (
    "id" VARCHAR(66) NOT NULL,
    "uuid" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "step_name" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "step_items" JSON NOT NULL,
    "step_order" INTEGER NOT NULL,
    "space_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "guide_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guides_guide_steps" (
    "id" VARCHAR(255) NOT NULL,
    "guide_step_id" VARCHAR(66) NOT NULL,
    "guide_id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "space_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "guides_guide_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "guide_steps" ADD CONSTRAINT "guide_steps_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guides_guide_steps" ADD CONSTRAINT "guides_guide_steps_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guides_guide_steps" ADD CONSTRAINT "guides_guide_steps_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guides_guide_steps" ADD CONSTRAINT "guides_guide_steps_guide_step_id_fkey" FOREIGN KEY ("guide_step_id") REFERENCES "guide_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

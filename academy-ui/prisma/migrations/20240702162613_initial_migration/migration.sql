-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "public_address" TEXT,
    "phone_number" TEXT,
    "space_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "auth_provider" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "crypto_login_nonce" (
    "user_id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" VARCHAR(64) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "avatar" VARCHAR(255),
    "admins" TEXT[],
    "admin_usernames" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "admin_usernames_v1" JSONB[],
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skin" VARCHAR(128) NOT NULL DEFAULT 'dodao',
    "discord_invite" VARCHAR(1024),
    "telegram_invite" VARCHAR(1024),
    "invite_links" JSON,
    "auth_settings" JSON NOT NULL DEFAULT '{}',
    "guide_settings" JSON NOT NULL DEFAULT '{}',
    "social_settings" JSON NOT NULL DEFAULT '{}',
    "byte_settings" JSON NOT NULL DEFAULT '{}',
    "features" TEXT[],
    "botDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "theme_colors" JSON,
    "type" VARCHAR(255) NOT NULL DEFAULT 'ACADEMY_SITE',
    "tidbits_homepage" JSON,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "course_integrations" (
    "id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(255) NOT NULL,
    "course_key" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(256),
    "discord_role_ids" JSON,
    "discord_role_passing_count" INTEGER,
    "discord_webhook" VARCHAR(1024),
    "project_galaxy_credential_id" VARCHAR(255),
    "project_galaxy_oat_mint_url" VARCHAR(255),
    "project_galaxy_oat_passing_count" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(256),
    "project_galaxy_oat_minted_content" TEXT,

    CONSTRAINT "course_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "git_courses" (
    "id" VARCHAR(255) NOT NULL,
    "course_key" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(256),
    "weight" INTEGER NOT NULL DEFAULT 20,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(256),
    "course_repo_url" VARCHAR(1024) NOT NULL,
    "publish_status" VARCHAR(128) NOT NULL DEFAULT 'Live',
    "course_admins" JSON NOT NULL,

    CONSTRAINT "git_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_integrations" (
    "id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(255) NOT NULL,
    "guide_uuid" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(256),
    "discord_role_ids" JSON,
    "discord_role_passing_count" INTEGER,
    "discord_webhook" VARCHAR(1024),
    "project_galaxy_credential_id" VARCHAR(255),
    "project_galaxy_oat_mint_url" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(256),
    "project_galaxy_oat_passing_count" INTEGER,

    CONSTRAINT "guide_integrations_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "guides_guide_steps" (
    "id" VARCHAR(255) NOT NULL,
    "guide_step_id" VARCHAR(66) NOT NULL,
    "guide_id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "space_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "guides_guide_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_integrations" (
    "id" VARCHAR(255) NOT NULL,
    "space_id" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(256),
    "discord_guild_id" VARCHAR(255),
    "project_galaxy_token" VARCHAR(256),
    "project_galaxy_token_last_four" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(256),
    "gnosis_safe_wallets" JSON,
    "git_guide_repositories" JSON[],
    "academy_repository" VARCHAR(2048),
    "loadersInfo" JSON,

    CONSTRAINT "space_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "byte_collections_category" (
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

    CONSTRAINT "byte_collections_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_discords" (
    "id" VARCHAR(255) NOT NULL,
    "access_token" VARCHAR(255) NOT NULL,
    "access_token_expiry" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refresh_token" VARCHAR(255) NOT NULL,
    "selected_guide_id" VARCHAR(255),
    "space_id" VARCHAR(66) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_discords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_public_address_space_id_key" ON "users"("public_address", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_space_id_key" ON "users"("username", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_space_id_key" ON "users"("email", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_login_nonce_user_id_key" ON "crypto_login_nonce"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bytes_id_key" ON "bytes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "course_integrations_space_id_course_key_key" ON "course_integrations"("space_id", "course_key");

-- CreateIndex
CREATE UNIQUE INDEX "git_courses_space_id_course_key_key" ON "git_courses"("space_id", "course_key");

-- CreateIndex
CREATE UNIQUE INDEX "guide_integrations_space_id_guide_uuid_key" ON "guide_integrations"("space_id", "guide_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "space_integrations_space_id_key" ON "space_integrations"("space_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_login_nonce" ADD CONSTRAINT "crypto_login_nonce_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bytes" ADD CONSTRAINT "bytes_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_integrations" ADD CONSTRAINT "course_integrations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_courses" ADD CONSTRAINT "git_courses_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_integrations" ADD CONSTRAINT "guide_integrations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_steps" ADD CONSTRAINT "guide_steps_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_submissions" ADD CONSTRAINT "guide_submissions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guides_guide_steps" ADD CONSTRAINT "guides_guide_steps_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_integrations" ADD CONSTRAINT "space_integrations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "byte_collections_category" ADD CONSTRAINT "byte_collections_category_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_discords" ADD CONSTRAINT "space_discords_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

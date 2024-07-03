-- CreateTable
CREATE TABLE "spaces" (
    "id" VARCHAR(64) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "avatar" VARCHAR(255),
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
CREATE UNIQUE INDEX "space_integrations_space_id_key" ON "space_integrations"("space_id");

-- AddForeignKey
ALTER TABLE "space_integrations" ADD CONSTRAINT "space_integrations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_discords" ADD CONSTRAINT "space_discords_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

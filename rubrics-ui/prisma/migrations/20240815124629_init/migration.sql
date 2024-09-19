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
    "password" TEXT,
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
    "admin_usernames_v1" JSONB[],
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "auth_settings" JSON NOT NULL DEFAULT '{}',
    "features" TEXT[],
    "theme_colors" JSON,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" VARCHAR(64) NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "summary" TEXT NOT NULL,
    "space_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubrics" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "space_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_rubric_mappings" (
    "id" VARCHAR(64) NOT NULL,
    "program_id" VARCHAR(64) NOT NULL,
    "rubric_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "program_rubric_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_levels" (
    "id" VARCHAR(64) NOT NULL,
    "column_name" VARCHAR(64) NOT NULL,
    "description" VARCHAR(64),
    "score" INTEGER NOT NULL,
    "rubric_id" VARCHAR(64) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rubric_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criterias" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(64) NOT NULL,
    "rubric_id" VARCHAR(64) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rubric_criterias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_cells" (
    "id" VARCHAR(64) NOT NULL,
    "description" VARCHAR(64) NOT NULL,
    "level_id" VARCHAR(64) NOT NULL,
    "criteria_id" VARCHAR(64) NOT NULL,
    "rubric_id" VARCHAR(64) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rubric_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_ratings" (
    "id" VARCHAR(64) NOT NULL,
    "rubric_id" VARCHAR(64) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "rubric_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_cell_selections" (
    "id" VARCHAR(64) NOT NULL,
    "rubric_cell_id" VARCHAR(64) NOT NULL,
    "rubric_rating_id" VARCHAR(64) NOT NULL,
    "comment" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "rating_cell_selections_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "program_rubric_mappings_program_id_rubric_id_key" ON "program_rubric_mappings"("program_id", "rubric_id");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criterias_rubric_id_title_key" ON "rubric_criterias"("rubric_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_cells_rubric_id_level_id_criteria_id_key" ON "rubric_cells"("rubric_id", "level_id", "criteria_id");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_ratings_rubric_id_user_id_key" ON "rubric_ratings"("rubric_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rating_cell_selections_rubric_cell_id_rubric_rating_id_key" ON "rating_cell_selections"("rubric_cell_id", "rubric_rating_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_login_nonce" ADD CONSTRAINT "crypto_login_nonce_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_rubric_mappings" ADD CONSTRAINT "program_rubric_mappings_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_rubric_mappings" ADD CONSTRAINT "program_rubric_mappings_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_levels" ADD CONSTRAINT "rubric_levels_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criterias" ADD CONSTRAINT "rubric_criterias_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cells" ADD CONSTRAINT "rubric_cells_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cells" ADD CONSTRAINT "rubric_cells_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "rubric_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cells" ADD CONSTRAINT "rubric_cells_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "rubric_criterias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_ratings" ADD CONSTRAINT "rubric_ratings_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_ratings" ADD CONSTRAINT "rubric_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selections" ADD CONSTRAINT "rating_cell_selections_rubric_cell_id_fkey" FOREIGN KEY ("rubric_cell_id") REFERENCES "rubric_cells"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selections" ADD CONSTRAINT "rating_cell_selections_rubric_rating_id_fkey" FOREIGN KEY ("rubric_rating_id") REFERENCES "rubric_ratings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selections" ADD CONSTRAINT "rating_cell_selections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

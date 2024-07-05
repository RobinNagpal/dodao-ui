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
CREATE TABLE "Program" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubric" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "programId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricLevel" (
    "id" VARCHAR(255) NOT NULL,
    "rubricId" VARCHAR(255) NOT NULL,
    "columnName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "RubricLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriteria" (
    "id" VARCHAR(255) NOT NULL,
    "rubricId" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "RubricCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCell" (
    "id" VARCHAR(255) NOT NULL,
    "rubricId" VARCHAR(255) NOT NULL,
    "levelId" VARCHAR(255),
    "criteriaId" VARCHAR(255),
    "description" TEXT NOT NULL,

    CONSTRAINT "RubricCell_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_login_nonce" ADD CONSTRAINT "crypto_login_nonce_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rubric" ADD CONSTRAINT "Rubric_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricLevel" ADD CONSTRAINT "RubricLevel_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriteria" ADD CONSTRAINT "RubricCriteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCell" ADD CONSTRAINT "RubricCell_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCell" ADD CONSTRAINT "RubricCell_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "RubricLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCell" ADD CONSTRAINT "RubricCell_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "RubricCriteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

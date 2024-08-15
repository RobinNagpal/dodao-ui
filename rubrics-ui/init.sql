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
CREATE TABLE "program" (
    "id" VARCHAR(64) NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "summary" TEXT NOT NULL,
    "space_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "space_id" VARCHAR(255),

    CONSTRAINT "rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_rubric_mapping" (
    "id" VARCHAR(64) NOT NULL,
    "programId" VARCHAR(64) NOT NULL,
    "rubricId" VARCHAR(64) NOT NULL,

    CONSTRAINT "program_rubric_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_level" (
    "id" VARCHAR(64) NOT NULL,
    "columnName" VARCHAR(64) NOT NULL,
    "description" VARCHAR(64),
    "score" INTEGER,
    "rubricId" VARCHAR(64) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rubric_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criteria" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(64) NOT NULL,
    "rubricId" VARCHAR(64) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_cell" (
    "id" VARCHAR(64) NOT NULL,
    "description" VARCHAR(64) NOT NULL,
    "levelId" VARCHAR(64),
    "criteriaId" VARCHAR(64),
    "rubricId" VARCHAR(64) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rubric_cell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_rating" (
    "id" VARCHAR(64) NOT NULL,
    "rubricId" VARCHAR(64) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "rubric_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_cell_selection" (
    "id" VARCHAR(64) NOT NULL,
    "rubricCellId" VARCHAR(64) NOT NULL,
    "rubricRatingId" VARCHAR(64) NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "rating_cell_selection_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "program_rubric_mapping_programId_rubricId_key" ON "program_rubric_mapping"("programId", "rubricId");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criteria_rubricId_title_key" ON "rubric_criteria"("rubricId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_cell_rubricId_levelId_criteriaId_key" ON "rubric_cell"("rubricId", "levelId", "criteriaId");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_rating_rubricId_userId_key" ON "rubric_rating"("rubricId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "rating_cell_selection_rubricCellId_rubricRatingId_key" ON "rating_cell_selection"("rubricCellId", "rubricRatingId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_login_nonce" ADD CONSTRAINT "crypto_login_nonce_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric" ADD CONSTRAINT "rubric_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_rubric_mapping" ADD CONSTRAINT "program_rubric_mapping_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_rubric_mapping" ADD CONSTRAINT "program_rubric_mapping_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_level" ADD CONSTRAINT "rubric_level_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cell" ADD CONSTRAINT "rubric_cell_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cell" ADD CONSTRAINT "rubric_cell_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "rubric_level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cell" ADD CONSTRAINT "rubric_cell_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "rubric_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_rating" ADD CONSTRAINT "rubric_rating_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_rating" ADD CONSTRAINT "rubric_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selection" ADD CONSTRAINT "rating_cell_selection_rubricCellId_fkey" FOREIGN KEY ("rubricCellId") REFERENCES "rubric_cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selection" ADD CONSTRAINT "rating_cell_selection_rubricRatingId_fkey" FOREIGN KEY ("rubricRatingId") REFERENCES "rubric_rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selection" ADD CONSTRAINT "rating_cell_selection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

insert into
    spaces (
        id,
        verified,
        created_at,
        creator,
        name,
        updated_at,
        avatar,
        admin_usernames_v1,
        domains,
        auth_settings,
        features,
        theme_colors
    )
values
    (
        'test-academy-eth',
        true,
        '2023-07-08 19:19:16.998',
        'clhjfyne00000mc08gc4wsqs0',
        'The Test Academy',
        '2023-08-10 20:04:43.664',
        'https://d31h13bdjwgzxs.cloudfront.net/academy/daocubator/daocubator_logo.jpg',
        '{}',
        '{}',
        '{"enableLogin":false,"loginOptions":["Discord","MetaMask","Google","Coinbase","Near"]}',
        '{}',
        '{"primaryColor":"#384aff","bgColor":"#ffffff","textColor":"#57606a","linkColor":"#111111","headingColor":"#111111","borderColor":"#d0d7de","blockBg":"#F5F9FF"}'
    );

    INSERT INTO program (
    id, 
    name, 
    details, 
    summary, 
    space_id
) 
VALUES (
    'program-1', 
    'Test Program 1', 
    'Details of Test Program 1', 
    'Summary of Test Program 1', 
    'test-academy-eth'
);

INSERT INTO rubric (
    id, 
    name, 
    summary, 
    description, 
    space_id
) 
VALUES (
    'rubric-1', 
    'Test Rubric 1', 
    'Summary of Test Rubric 1', 
    'Description of Test Rubric 1', 
    'test-academy-eth'
);
INSERT INTO program_rubric_mapping (
    id, 
    "programId",  
    "rubricId"   
) 
VALUES (
    'mapping-1', 
    'program-1', 
    'rubric-1'
);
INSERT INTO rubric_criteria (
    id, 
    title, 
    "rubricId"
) 
VALUES (
    'criteria-1', 
    'Content', 
    'rubric-1'
), 
(
    'criteria-2', 
    'Comprehensibility', 
    'rubric-1'
);

INSERT INTO rubric_level (
    id, 
    "columnName", 
    description, 
    score, 
    "rubricId"
) 
VALUES (
    'level-1', 
    'Excellent', 
    'Complete and clear.', 
    4, 
    'rubric-1'
), 
(
    'level-2', 
    'Good', 
    'Generally clear.', 
    3, 
    'rubric-1'
), 
(
    'level-3', 
    'Fair', 
    'Somewhat unclear.', 
    2, 
    'rubric-1'
), 
(
    'level-4', 
    'Improvement', 
    'Unclear.', 
    1, 
    'rubric-1'
);

INSERT INTO rubric_cell (
    id, 
    description, 
    "rubricId", 
    "levelId", 
    "criteriaId"
) 
VALUES (
    'cell-1', 
    'Detailed and accurate content.', 
    'rubric-1', 
    'level-1', 
    'criteria-1'
), 
(
    'cell-2', 
    'Adequate content.', 
    'rubric-1', 
    'level-2', 
    'criteria-1'
), 
(
    'cell-3', 
    'Content needs more clarity.', 
    'rubric-1', 
    'level-3', 
    'criteria-1'
), 
(
    'cell-4', 
    'Content is unclear.', 
    'rubric-1', 
    'level-4', 
    'criteria-1'
),
(
    'cell-5', 
    'Clear and comprehensible.', 
    'rubric-1', 
    'level-1', 
    'criteria-2'
), 
(
    'cell-6', 
    'Mostly comprehensible.', 
    'rubric-1', 
    'level-2', 
    'criteria-2'
), 
(
    'cell-7', 
    'Somewhat comprehensible.', 
    'rubric-1', 
    'level-3', 
    'criteria-2'
), 
(
    'cell-8', 
    'Incomprehensible.', 
    'rubric-1', 
    'level-4', 
    'criteria-2'
);




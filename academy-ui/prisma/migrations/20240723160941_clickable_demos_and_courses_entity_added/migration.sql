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
CREATE TABLE "git_course_submissions" (
    "uuid" VARCHAR(66) NOT NULL,
    "course_key" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64) NOT NULL,
    "is_latest_submission" BOOLEAN NOT NULL,
    "questions_attempted" INTEGER,
    "questions_correct" INTEGER,
    "questions_incorrect" INTEGER,
    "questions_skipped" INTEGER,
    "space_id" VARCHAR(64) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(64) NOT NULL DEFAULT 'InProgress',
    "galaxy_credentials_updated" BOOLEAN,

    CONSTRAINT "git_course_submissions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "git_course_topic_submissions" (
    "uuid" VARCHAR(66) NOT NULL,
    "course_key" VARCHAR(128) NOT NULL,
    "course_submission_uuid" VARCHAR(66) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64) NOT NULL,
    "is_latest_submission" BOOLEAN NOT NULL,
    "questions_attempted" INTEGER,
    "questions_correct" INTEGER,
    "questions_incorrect" INTEGER,
    "questions_skipped" INTEGER,
    "submission" JSON NOT NULL,
    "space_id" VARCHAR(64) NOT NULL,
    "topic_key" VARCHAR(128) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(64) NOT NULL DEFAULT 'InProgress',
    "correct_answers" JSONB,

    CONSTRAINT "git_course_topic_submissions_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "git_courses_space_id_course_key_key" ON "git_courses"("space_id", "course_key");

-- AddForeignKey
ALTER TABLE "git_courses" ADD CONSTRAINT "git_courses_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_course_topic_submissions" ADD CONSTRAINT "git_course_topic_submissions_course_submission_uuid_fkey" FOREIGN KEY ("course_submission_uuid") REFERENCES "git_course_submissions"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

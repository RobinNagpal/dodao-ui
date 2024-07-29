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
CREATE TABLE "course_submissions" (
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

    CONSTRAINT "course_submissions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "course_topic_submissions" (
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

    CONSTRAINT "course_topic_submissions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "timelines" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "excerpt" VARCHAR(256) NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail" VARCHAR(255),
    "space_id" VARCHAR(66) NOT NULL,
    "created" VARCHAR(255) NOT NULL,
    "publishStatus" TEXT NOT NULL,
    "events" JSONB[],
    "admins" TEXT[],
    "tags" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 50,
    "timelineStyle" VARCHAR(255),

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" VARCHAR(255) NOT NULL,
    "key" TEXT NOT NULL,
    "space_id" VARCHAR(256) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "duration" VARCHAR(256) NOT NULL,
    "highlights" TEXT[],
    "publish_status" VARCHAR(66) NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "course_admins" TEXT[],
    "course_pass_content" TEXT,
    "course_fail_content" TEXT,
    "course_pass_count" INTEGER,
    "prority" INTEGER DEFAULT 50,
    "topic_config" JSONB NOT NULL,
    "topics" JSONB[],

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_id_key" ON "courses"("id");

-- AddForeignKey
ALTER TABLE "course_topic_submissions" ADD CONSTRAINT "course_topic_submissions_course_submission_uuid_fkey" FOREIGN KEY ("course_submission_uuid") REFERENCES "course_submissions"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

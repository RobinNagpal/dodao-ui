-- CreateTable
CREATE TABLE "clickable_demo_html_cpatures" (
    "id" VARCHAR(255) NOT NULL,
    "clickable_demo_id" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(1024) NOT NULL,
    "file_url" VARCHAR(1024) NOT NULL,
    "file_image_url" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clickable_demo_html_cpatures_pkey" PRIMARY KEY ("id")
);

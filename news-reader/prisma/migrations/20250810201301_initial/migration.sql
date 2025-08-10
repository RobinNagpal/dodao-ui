-- CreateTable
CREATE TABLE "news_topic_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filters" TEXT[],
    "is_default" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "news_topic_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_topic_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "news_topic_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_topics" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filters" TEXT[],
    "template_used" TEXT NOT NULL,
    "folder_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "newsTopicTemplateId" TEXT,

    CONSTRAINT "news_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "filters" TEXT[],
    "source" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "full_content" TEXT,
    "topic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "article_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "article_sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "news_topic_folders" ADD CONSTRAINT "news_topic_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "news_topic_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_topics" ADD CONSTRAINT "news_topics_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "news_topic_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_topics" ADD CONSTRAINT "news_topics_newsTopicTemplateId_fkey" FOREIGN KEY ("newsTopicTemplateId") REFERENCES "news_topic_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "news_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sources" ADD CONSTRAINT "article_sources_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "news_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

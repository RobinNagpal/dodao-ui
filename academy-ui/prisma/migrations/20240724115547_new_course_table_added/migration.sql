-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "highlights" TEXT[],
    "publishStatus" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "courseAdmins" JSONB,
    "coursePassContent" TEXT NOT NULL,
    "topicConfig" JSONB NOT NULL,
    "topics" JSONB[],

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

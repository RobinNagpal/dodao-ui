-- AlterTable
ALTER TABLE "case_study_enrollments" ADD COLUMN     "final_summary_prompt_instructions" TEXT;

-- CreateTable
CREATE TABLE "final_summaries" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "model" TEXT,
    "response" TEXT,
    "status" TEXT,
    "error" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "final_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "final_summaries_student_id_key" ON "final_summaries"("student_id");

-- AddForeignKey
ALTER TABLE "final_summaries" ADD CONSTRAINT "final_summaries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "enrollment_students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

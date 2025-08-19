/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `final_submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "final_submissions_student_id_key" ON "final_submissions"("student_id");

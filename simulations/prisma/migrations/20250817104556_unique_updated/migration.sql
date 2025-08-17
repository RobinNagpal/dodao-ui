/*
  Warnings:

  - A unique constraint covering the columns `[enrollment_id,assigned_student_id]` on the table `enrollment_students` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "uq_enrollment_student";

-- CreateIndex
CREATE UNIQUE INDEX "uq_enrollment_student" ON "enrollment_students"("enrollment_id", "assigned_student_id");

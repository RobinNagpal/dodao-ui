/*
  Warnings:

  - You are about to drop the `enrollment_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topic_exercises` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "enrollment_members" DROP CONSTRAINT "enrollment_members_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "exercise_attempts" DROP CONSTRAINT "exercise_attempts_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "topic_exercises" DROP CONSTRAINT "topic_exercises_module_id_fkey";

-- DropTable
DROP TABLE "enrollment_members";

-- DropTable
DROP TABLE "topic_exercises";

-- CreateTable
CREATE TABLE "enrollment_students" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "assigned_student_id" TEXT NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_exercises" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_enrollment_student" ON "enrollment_students"("enrollment_id", "created_by");

-- AddForeignKey
ALTER TABLE "enrollment_students" ADD CONSTRAINT "enrollment_students_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "case_study_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_exercises" ADD CONSTRAINT "module_exercises_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "case_study_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "module_exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

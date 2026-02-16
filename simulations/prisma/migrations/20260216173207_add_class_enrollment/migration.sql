-- AlterTable
ALTER TABLE "user_activity_logs" ADD COLUMN     "class_enrollment_id" TEXT;

-- CreateIndex
CREATE INDEX "user_activity_logs_class_enrollment_id_idx" ON "user_activity_logs"("class_enrollment_id");

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_class_enrollment_id_fkey" FOREIGN KEY ("class_enrollment_id") REFERENCES "case_study_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

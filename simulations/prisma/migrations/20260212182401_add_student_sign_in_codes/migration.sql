-- CreateTable
CREATE TABLE "student_sign_in_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "student_sign_in_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_sign_in_codes_code_key" ON "student_sign_in_codes"("code");

-- CreateIndex
CREATE INDEX "student_sign_in_codes_user_id_idx" ON "student_sign_in_codes"("user_id");

-- AddForeignKey
ALTER TABLE "student_sign_in_codes" ADD CONSTRAINT "student_sign_in_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_sign_in_codes" ADD CONSTRAINT "student_sign_in_codes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

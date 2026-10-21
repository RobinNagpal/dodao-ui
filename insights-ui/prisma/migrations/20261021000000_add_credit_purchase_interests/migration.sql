-- CreateTable
CREATE TABLE "credit_purchase_interests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "pack_key" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "page_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_purchase_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_purchase_interests_space_id_created_at_idx" ON "credit_purchase_interests"("space_id", "created_at");

-- CreateIndex
CREATE INDEX "credit_purchase_interests_user_id_idx" ON "credit_purchase_interests"("user_id");

-- AddForeignKey
ALTER TABLE "credit_purchase_interests" ADD CONSTRAINT "credit_purchase_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


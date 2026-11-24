-- Logged-out visitors can now record credit purchase interest.
ALTER TABLE "credit_purchase_interests" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "credit_purchase_interests" ADD COLUMN "anonymous_id" TEXT;
ALTER TABLE "credit_purchase_interests" ADD COLUMN "ip_hash" TEXT;
ALTER TABLE "credit_purchase_interests" ADD COLUMN "country" TEXT;

-- CreateIndex
CREATE INDEX "credit_purchase_interests_anonymous_id_idx" ON "credit_purchase_interests"("anonymous_id");

-- CreateIndex
CREATE INDEX "credit_purchase_interests_ip_hash_created_at_idx" ON "credit_purchase_interests"("ip_hash", "created_at");

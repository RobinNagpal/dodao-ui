-- Deleting a user must not silently cascade-delete their credit purchase and
-- paid-run records (financial history, and the refund / dispute lookup). The
-- foreign keys now RESTRICT: those rows have to be dealt with explicitly first.

-- DropForeignKey
ALTER TABLE "report_spends" DROP CONSTRAINT "report_spends_user_id_fkey";

-- DropForeignKey
ALTER TABLE "stripe_credit_purchases" DROP CONSTRAINT "stripe_credit_purchases_user_id_fkey";

-- AddForeignKey
ALTER TABLE "report_spends" ADD CONSTRAINT "report_spends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_credit_purchases" ADD CONSTRAINT "stripe_credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

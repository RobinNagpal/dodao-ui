-- CreateEnum
CREATE TYPE "DeliveryChannelType" AS ENUM ('EMAIL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('ONCE_PER_ALERT', 'AT_MOST_ONCE_PER_3_HOURS', 'AT_MOST_ONCE_PER_6_HOURS', 'AT_MOST_ONCE_PER_12_HOURS', 'AT_MOST_ONCE_PER_DAY', 'AT_MOST_ONCE_PER_WEEK');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('GENERAL', 'PERSONALIZED');

-- CreateEnum
CREATE TYPE "AlertActionType" AS ENUM ('SUPPLY', 'BORROW');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('APR_RISE_ABOVE', 'APR_FALLS_BELOW', 'APR_OUTSIDE_RANGE', 'RATE_DIFF_ABOVE', 'RATE_DIFF_BELOW');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateTable
CREATE TABLE "crypto_login_nonce" (
    "user_id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "public_address" TEXT,
    "phone_number" TEXT,
    "space_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "auth_provider" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" VARCHAR(64) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "avatar" VARCHAR(255),
    "admin_usernames_v1" JSONB[],
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "auth_settings" JSON NOT NULL DEFAULT '{}',
    "features" TEXT[],
    "theme_colors" JSON,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chains" (
    "chain_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "chains_pkey" PRIMARY KEY ("chain_id")
);

-- CreateTable
CREATE TABLE "assets" (
    "chain_id_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("chain_id_address")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "category" "AlertCategory" NOT NULL,
    "action_type" "AlertActionType" NOT NULL,
    "is_comparison" BOOLEAN NOT NULL DEFAULT false,
    "wallet_address" TEXT,
    "compare_protocols" TEXT[],
    "notification_frequency" "NotificationFrequency" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_conditions" (
    "id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "condition_type" "ConditionType" NOT NULL,
    "threshold_value" DOUBLE PRECISION,
    "threshold_value_low" DOUBLE PRECISION,
    "threshold_value_high" DOUBLE PRECISION,
    "severity" "SeverityLevel" NOT NULL,

    CONSTRAINT "alert_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_channels" (
    "id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "channel_type" "DeliveryChannelType" NOT NULL,
    "email" TEXT,
    "webhook_url" TEXT,

    CONSTRAINT "delivery_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lending_and_borrowing_rates" (
    "id" TEXT NOT NULL,
    "protocol_name" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "asset_chain_id_address" TEXT NOT NULL,
    "net_earn_apy" DOUBLE PRECISION NOT NULL,
    "net_borrow_apy" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lending_and_borrowing_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_notifications" (
    "id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "alert_condition_ids" TEXT[],

    CONSTRAINT "alert_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sent_notifications" (
    "id" TEXT NOT NULL,
    "alert_notification_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlertChains" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AlertAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "crypto_login_nonce_user_id_key" ON "crypto_login_nonce"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_public_address_space_id_key" ON "users"("public_address", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_space_id_key" ON "users"("username", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_space_id_key" ON "users"("email", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "sent_notifications_alert_notification_id_key" ON "sent_notifications"("alert_notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AlertChains_AB_unique" ON "_AlertChains"("A", "B");

-- CreateIndex
CREATE INDEX "_AlertChains_B_index" ON "_AlertChains"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlertAssets_AB_unique" ON "_AlertAssets"("A", "B");

-- CreateIndex
CREATE INDEX "_AlertAssets_B_index" ON "_AlertAssets"("B");

-- AddForeignKey
ALTER TABLE "crypto_login_nonce" ADD CONSTRAINT "crypto_login_nonce_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_conditions" ADD CONSTRAINT "alert_conditions_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_channels" ADD CONSTRAINT "delivery_channels_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lending_and_borrowing_rates" ADD CONSTRAINT "lending_and_borrowing_rates_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lending_and_borrowing_rates" ADD CONSTRAINT "lending_and_borrowing_rates_asset_chain_id_address_fkey" FOREIGN KEY ("asset_chain_id_address") REFERENCES "assets"("chain_id_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_notifications" ADD CONSTRAINT "alert_notifications_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_notifications" ADD CONSTRAINT "sent_notifications_alert_notification_id_fkey" FOREIGN KEY ("alert_notification_id") REFERENCES "alert_notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertChains" ADD CONSTRAINT "_AlertChains_A_fkey" FOREIGN KEY ("A") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertChains" ADD CONSTRAINT "_AlertChains_B_fkey" FOREIGN KEY ("B") REFERENCES "chains"("chain_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertAssets" ADD CONSTRAINT "_AlertAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertAssets" ADD CONSTRAINT "_AlertAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "assets"("chain_id_address") ON DELETE CASCADE ON UPDATE CASCADE;

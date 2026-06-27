-- CreateEnum
CREATE TYPE "ConversionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CashbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "clicks" (
    "id" TEXT NOT NULL,
    "click_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "product_source_id" TEXT,
    "merchant_id" TEXT,
    "campaign_id" TEXT,
    "affiliate_network_id" TEXT,
    "subid1" TEXT,
    "subid2" TEXT,
    "subid3" TEXT,
    "subid4" TEXT,
    "subid5" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversions" (
    "id" TEXT NOT NULL,
    "click_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "order_amount" DOUBLE PRECISION NOT NULL,
    "commission_amount" DOUBLE PRECISION NOT NULL,
    "cashback_amount" DOUBLE PRECISION NOT NULL,
    "status" "ConversionStatus" NOT NULL DEFAULT 'PENDING',
    "conversion_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cashbacks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conversion_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "CashbackStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cashbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_ledgers" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "LedgerType" NOT NULL,
    "description" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_flags" (
    "id" TEXT NOT NULL,
    "click_id" TEXT,
    "user_id" TEXT,
    "ip_address" TEXT,
    "reason" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clicks_click_id_key" ON "clicks"("click_id");

-- CreateIndex
CREATE INDEX "clicks_click_id_idx" ON "clicks"("click_id");

-- CreateIndex
CREATE INDEX "clicks_user_id_idx" ON "clicks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversions_transaction_id_key" ON "conversions"("transaction_id");

-- CreateIndex
CREATE INDEX "conversions_click_id_idx" ON "conversions"("click_id");

-- CreateIndex
CREATE INDEX "conversions_transaction_id_idx" ON "conversions"("transaction_id");

-- CreateIndex
CREATE INDEX "cashbacks_user_id_idx" ON "cashbacks"("user_id");

-- CreateIndex
CREATE INDEX "cashbacks_conversion_id_idx" ON "cashbacks"("conversion_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallet_ledgers_wallet_id_idx" ON "wallet_ledgers"("wallet_id");

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_click_id_fkey" FOREIGN KEY ("click_id") REFERENCES "clicks"("click_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashbacks" ADD CONSTRAINT "cashbacks_conversion_id_fkey" FOREIGN KEY ("conversion_id") REFERENCES "conversions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledgers" ADD CONSTRAINT "wallet_ledgers_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

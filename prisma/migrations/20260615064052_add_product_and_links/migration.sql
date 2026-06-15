-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image_urls" TEXT[],
    "image_public_ids" TEXT[],
    "price" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "cashback_percentage" DOUBLE PRECISION NOT NULL,
    "cashback_terms" TEXT NOT NULL,
    "tracking_time" INTEGER NOT NULL,
    "validation_time" INTEGER NOT NULL,
    "payment_release" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_affiliate_links" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "platform_name" TEXT NOT NULL,
    "affiliate_link" TEXT NOT NULL,
    "mrp" DOUBLE PRECISION NOT NULL,
    "sell_price" DOUBLE PRECISION NOT NULL,
    "cashback_percentage" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_affiliate_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "product_affiliate_links_product_id_idx" ON "product_affiliate_links"("product_id");

-- AddForeignKey
ALTER TABLE "product_affiliate_links" ADD CONSTRAINT "product_affiliate_links_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

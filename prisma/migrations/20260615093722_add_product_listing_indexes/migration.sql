-- DropIndex
DROP INDEX "products_is_active_idx";

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_is_active_is_deleted_idx" ON "products"("is_active", "is_deleted");

/*
  Warnings:

  - You are about to drop the column `affiliateUrl` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `cashbackText` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `termsAndConditions` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrl` on the `merchants` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `merchants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "merchants" DROP COLUMN "affiliateUrl",
DROP COLUMN "bannerUrl",
DROP COLUMN "cashbackText",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "isFeatured",
DROP COLUMN "logoUrl",
DROP COLUMN "termsAndConditions",
DROP COLUMN "updatedAt",
DROP COLUMN "websiteUrl",
ADD COLUMN     "affiliate_url" TEXT,
ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "cashback_text" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logo_public_id" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "terms_and_conditions" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website_url" TEXT;

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT NOT NULL,
    "image_public_id" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "offer_title" TEXT,
    "link" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'HERO',
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchants_slug_idx" ON "merchants"("slug");

-- CreateIndex
CREATE INDEX "merchants_is_active_idx" ON "merchants"("is_active");

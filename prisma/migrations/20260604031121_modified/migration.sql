/*
  Warnings:

  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `referral_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `referred_by` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_referral_code_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_hash",
DROP COLUMN "referral_code",
DROP COLUMN "referred_by",
ADD COLUMN     "is_phone_verified" BOOLEAN NOT NULL DEFAULT false;

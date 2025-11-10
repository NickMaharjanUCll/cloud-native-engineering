/*
  Warnings:

  - Added the required column `active` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Cart_customerId_key";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "active" BOOLEAN NOT NULL;

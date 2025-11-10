/*
  Warnings:

  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Products";

-- CreateTable
CREATE TABLE "Product" (
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "CartContainsProduct" (
    "cartId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "CartContainsProduct_pkey" PRIMARY KEY ("cartId","productName")
);

-- AddForeignKey
ALTER TABLE "CartContainsProduct" ADD CONSTRAINT "CartContainsProduct_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartContainsProduct" ADD CONSTRAINT "CartContainsProduct_productName_fkey" FOREIGN KEY ("productName") REFERENCES "Product"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

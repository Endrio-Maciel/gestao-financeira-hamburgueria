/*
  Warnings:

  - Changed the type of `closingDate` on the `CreditCard` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CreditCard" DROP COLUMN "closingDate",
ADD COLUMN     "closingDate" TIMESTAMP(3) NOT NULL;

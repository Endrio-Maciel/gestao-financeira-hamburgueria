-- DropForeignKey
ALTER TABLE "CreditCard" DROP CONSTRAINT "CreditCard_accountId_fkey";

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

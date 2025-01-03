-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "isFinalized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_date" TIMESTAMP(3);

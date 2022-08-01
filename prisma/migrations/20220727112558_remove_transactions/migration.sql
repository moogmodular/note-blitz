/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_contentItemId_fkey";

-- DropTable
DROP TABLE "Transaction";

-- DropEnum
DROP TYPE "TransactionReason";

/*
  Warnings:

  - You are about to drop the column `msatsReceived` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `msatsRequested` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `fromUserId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `toUserId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `LnAuth` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LnWith` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mSatsRequested` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('CONFIRMED', 'INSUFFICIENT_BALANCE', 'INVALID_PAYMENT', 'PATHFINDING_TIMEOUT', 'ROUTE_NOT_FOUND', 'UNKNOWN_FAILURE');

-- DropForeignKey
ALTER TABLE "LnWith" DROP CONSTRAINT "LnWith_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_toUserId_fkey";

-- DropIndex
DROP INDEX "Invoice_createdAt_idx";

-- DropIndex
DROP INDEX "Invoice_userId_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "msatsReceived",
DROP COLUMN "msatsRequested",
ADD COLUMN     "mSatsReceived" INTEGER,
ADD COLUMN     "mSatsRequested" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "fromUserId",
DROP COLUMN "toUserId";

-- DropTable
DROP TABLE "LnAuth";

-- DropTable
DROP TABLE "LnWith";

-- CreateTable
CREATE TABLE "LnAuthentication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "k1" TEXT NOT NULL,
    "pubkey" TEXT,

    CONSTRAINT "LnAuthentication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LnWithdrawal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "k1" TEXT NOT NULL,
    "withdrawalId" TEXT,
    "userId" TEXT,

    CONSTRAINT "LnWithdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hash" TEXT NOT NULL,
    "bolt11" TEXT NOT NULL,
    "mSatsPaying" INTEGER NOT NULL,
    "mSatsPaid" INTEGER,
    "mSatsFeePaying" INTEGER NOT NULL,
    "mSatsFeePaid" INTEGER,
    "userId" TEXT,
    "status" "WithdrawalStatus",

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LnAuthentication_k1_key" ON "LnAuthentication"("k1");

-- CreateIndex
CREATE UNIQUE INDEX "LnWithdrawal_k1_key" ON "LnWithdrawal"("k1");

-- AddForeignKey
ALTER TABLE "LnWithdrawal" ADD CONSTRAINT "LnWithdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

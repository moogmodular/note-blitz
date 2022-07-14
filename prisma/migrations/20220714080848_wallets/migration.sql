/*
  Warnings:

  - You are about to drop the `lnurl_migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lnurl_migrations_lock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "lnurl_migrations";

-- DropTable
DROP TABLE "lnurl_migrations_lock";

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

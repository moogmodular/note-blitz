-- DropForeignKey
ALTER TABLE "LnAuth" DROP CONSTRAINT "LnAuth_userId_fkey";

-- AlterTable
ALTER TABLE "LnAuth" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LnAuth" ADD CONSTRAINT "LnAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

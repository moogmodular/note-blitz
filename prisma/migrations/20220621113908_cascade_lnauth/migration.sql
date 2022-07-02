-- DropForeignKey
ALTER TABLE "LnAuth" DROP CONSTRAINT "LnAuth_userId_fkey";

-- AddForeignKey
ALTER TABLE "LnAuth" ADD CONSTRAINT "LnAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

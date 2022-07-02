-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PUBLISHED', 'SOFT_DELETED');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

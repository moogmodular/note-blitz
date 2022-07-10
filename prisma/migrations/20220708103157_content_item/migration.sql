/*
  Warnings:

  - The values [TIP_POST,TIP_COMMENT] on the enum `TransactionReason` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `commentId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MentionedUsersOnComments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MentionedUsersOnPosts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagsOnComments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagsOnPosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionReason_new" AS ENUM ('PAYMENT_OUT', 'PAYMENT_IN', 'TIP_CONTENT_ITEM', 'UNLOCK_POST_COMMENT');
ALTER TABLE "Transaction" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionReason_new" USING ("type"::text::"TransactionReason_new");
ALTER TYPE "TransactionReason" RENAME TO "TransactionReason_old";
ALTER TYPE "TransactionReason_new" RENAME TO "TransactionReason";
DROP TYPE "TransactionReason_old";
ALTER TABLE "Transaction" ALTER COLUMN "type" SET DEFAULT 'PAYMENT_IN';
COMMIT;

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "MentionedUsersOnComments" DROP CONSTRAINT "MentionedUsersOnComments_commentId_fkey";

-- DropForeignKey
ALTER TABLE "MentionedUsersOnComments" DROP CONSTRAINT "MentionedUsersOnComments_userId_fkey";

-- DropForeignKey
ALTER TABLE "MentionedUsersOnPosts" DROP CONSTRAINT "MentionedUsersOnPosts_postId_fkey";

-- DropForeignKey
ALTER TABLE "MentionedUsersOnPosts" DROP CONSTRAINT "MentionedUsersOnPosts_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnComments" DROP CONSTRAINT "TagsOnComments_commentId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnComments" DROP CONSTRAINT "TagsOnComments_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnPosts" DROP CONSTRAINT "TagsOnPosts_postId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnPosts" DROP CONSTRAINT "TagsOnPosts_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_postId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "commentId",
DROP COLUMN "postId",
ADD COLUMN     "contentItemId" TEXT,
ALTER COLUMN "type" SET DEFAULT 'PAYMENT_IN';

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "MentionedUsersOnComments";

-- DropTable
DROP TABLE "MentionedUsersOnPosts";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "TagsOnComments";

-- DropTable
DROP TABLE "TagsOnPosts";

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "excerpt" TEXT,
    "authorId" TEXT NOT NULL,
    "headerImage" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentionedUsersOnContentItems" (
    "contentItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MentionedUsersOnContentItems_pkey" PRIMARY KEY ("contentItemId","userId")
);

-- CreateTable
CREATE TABLE "TagsOnContentItems" (
    "contentItemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagsOnContentItems_pkey" PRIMARY KEY ("contentItemId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_slug_key" ON "ContentItem"("slug");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedUsersOnContentItems" ADD CONSTRAINT "MentionedUsersOnContentItems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedUsersOnContentItems" ADD CONSTRAINT "MentionedUsersOnContentItems_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnContentItems" ADD CONSTRAINT "TagsOnContentItems_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnContentItems" ADD CONSTRAINT "TagsOnContentItems_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

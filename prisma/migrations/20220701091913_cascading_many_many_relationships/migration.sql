-- DropForeignKey
ALTER TABLE "MentionedUsersOnComments" DROP CONSTRAINT "MentionedUsersOnComments_commentId_fkey";

-- DropForeignKey
ALTER TABLE "MentionedUsersOnComments" DROP CONSTRAINT "MentionedUsersOnComments_userId_fkey";

-- DropForeignKey
ALTER TABLE "MentionedUsersOnPosts" DROP CONSTRAINT "MentionedUsersOnPosts_postId_fkey";

-- DropForeignKey
ALTER TABLE "MentionedUsersOnPosts" DROP CONSTRAINT "MentionedUsersOnPosts_userId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnComments" DROP CONSTRAINT "TagsOnComments_commentId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnComments" DROP CONSTRAINT "TagsOnComments_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnPosts" DROP CONSTRAINT "TagsOnPosts_postId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnPosts" DROP CONSTRAINT "TagsOnPosts_tagId_fkey";

-- AddForeignKey
ALTER TABLE "MentionedUsersOnComments" ADD CONSTRAINT "MentionedUsersOnComments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedUsersOnComments" ADD CONSTRAINT "MentionedUsersOnComments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnComments" ADD CONSTRAINT "TagsOnComments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnComments" ADD CONSTRAINT "TagsOnComments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedUsersOnPosts" ADD CONSTRAINT "MentionedUsersOnPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentionedUsersOnPosts" ADD CONSTRAINT "MentionedUsersOnPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnPosts" ADD CONSTRAINT "TagsOnPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnPosts" ADD CONSTRAINT "TagsOnPosts_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

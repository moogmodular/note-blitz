-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "contentItemSourceId" TEXT;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_contentItemSourceId_fkey" FOREIGN KEY ("contentItemSourceId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

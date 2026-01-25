-- AlterTable
ALTER TABLE "PendingBlock" ADD COLUMN     "pageId" INTEGER,
ALTER COLUMN "blockId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PendingBlock_pageId_idx" ON "PendingBlock"("pageId");

-- AddForeignKey
ALTER TABLE "PendingBlock" ADD CONSTRAINT "PendingBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

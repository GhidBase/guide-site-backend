/*
  Warnings:

  - You are about to drop the column `tags` on the `ChecklistItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChecklistItem" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChecklistItemToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChecklistItemToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChecklistItemToTag_B_index" ON "_ChecklistItemToTag"("B");

-- AddForeignKey
ALTER TABLE "_ChecklistItemToTag" ADD CONSTRAINT "_ChecklistItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistItemToTag" ADD CONSTRAINT "_ChecklistItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

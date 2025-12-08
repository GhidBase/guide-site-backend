/*
  Warnings:

  - A unique constraint covering the columns `[gameId,title]` on the table `Checklist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[checklistId,title]` on the table `ChecklistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Checklist_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "Checklist_gameId_title_key" ON "Checklist"("gameId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_checklistId_title_key" ON "ChecklistItem"("checklistId", "title");

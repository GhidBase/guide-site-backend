/*
  Warnings:

  - You are about to drop the column `pageId` on the `PendingBlock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PendingBlock" DROP CONSTRAINT "PendingBlock_pageId_fkey";

-- DropIndex
DROP INDEX "PendingBlock_pageId_idx";

-- AlterTable
ALTER TABLE "PendingBlock" DROP COLUMN "pageId";

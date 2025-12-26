/*
  Warnings:

  - You are about to drop the column `content2` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `blockAddress` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "content2";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "blockAddress",
ADD COLUMN     "blockId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

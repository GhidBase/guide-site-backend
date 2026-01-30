-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_gameId_fkey";

-- AlterTable
ALTER TABLE "Page" ALTER COLUMN "gameId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

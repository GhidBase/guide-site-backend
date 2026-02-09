-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_sectionId_fkey";

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "navbarTitle" TEXT,
ALTER COLUMN "sectionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

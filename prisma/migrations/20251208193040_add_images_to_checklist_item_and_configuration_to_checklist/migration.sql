-- AlterTable
ALTER TABLE "Checklist" ADD COLUMN     "configuration" TEXT;

-- AlterTable
ALTER TABLE "ChecklistItem" ADD COLUMN     "imageOne" TEXT,
ADD COLUMN     "imageTwo" TEXT;

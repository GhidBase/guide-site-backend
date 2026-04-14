-- AlterTable
ALTER TABLE "PendingBlock"
ADD COLUMN "oldContent" JSONB,
ADD COLUMN "newContent" JSONB,
ADD COLUMN "oldFiles" JSONB,
ADD COLUMN "newFiles" JSONB;

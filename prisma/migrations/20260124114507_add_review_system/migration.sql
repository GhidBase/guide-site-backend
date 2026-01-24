-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REFUSED');

-- CreateEnum
CREATE TYPE "PendingOperationType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ADD_FILE', 'DELETE_FILE');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING_UPLOAD', 'ACTIVE', 'PENDING_DELETION', 'DELETED');

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_blockId_fkey";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "FileStatus" NOT NULL DEFAULT 'PENDING_UPLOAD';

-- CreateTable
CREATE TABLE "PendingBlock" (
    "id" SERIAL NOT NULL,
    "blockId" INTEGER NOT NULL,
    "content" JSONB,
    "type" TEXT,
    "userId" INTEGER NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "reviewMessage" TEXT,
    "operation" "PendingOperationType" NOT NULL DEFAULT 'UPDATE',

    CONSTRAINT "PendingBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingBlock_status_idx" ON "PendingBlock"("status");

-- CreateIndex
CREATE INDEX "PendingBlock_userId_idx" ON "PendingBlock"("userId");

-- CreateIndex
CREATE INDEX "PendingBlock_blockId_idx" ON "PendingBlock"("blockId");

-- AddForeignKey
ALTER TABLE "PendingBlock" ADD CONSTRAINT "PendingBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingBlock" ADD CONSTRAINT "PendingBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingBlock" ADD CONSTRAINT "PendingBlock_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "TierSection" (
    "id" SERIAL NOT NULL,
    "modeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TierSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TierSection_modeId_idx" ON "TierSection"("modeId");

-- AddForeignKey
ALTER TABLE "TierSection" ADD CONSTRAINT "TierSection_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "TierMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "TierEntry" ADD COLUMN "sectionId" INTEGER;

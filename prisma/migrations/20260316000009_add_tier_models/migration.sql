-- CreateTable
CREATE TABLE "TierCategory" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TierCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierItem" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TierItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierMode" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TierMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierTier" (
    "id" SERIAL NOT NULL,
    "modeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TierTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierEntry" (
    "id" SERIAL NOT NULL,
    "modeId" INTEGER NOT NULL,
    "tierId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TierEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TierCategory_gameId_idx" ON "TierCategory"("gameId");
CREATE INDEX "TierItem_categoryId_idx" ON "TierItem"("categoryId");
CREATE INDEX "TierMode_categoryId_idx" ON "TierMode"("categoryId");
CREATE INDEX "TierTier_modeId_idx" ON "TierTier"("modeId");
CREATE INDEX "TierEntry_modeId_idx" ON "TierEntry"("modeId");
CREATE INDEX "TierEntry_tierId_idx" ON "TierEntry"("tierId");

-- AddForeignKey
ALTER TABLE "TierCategory" ADD CONSTRAINT "TierCategory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TierItem" ADD CONSTRAINT "TierItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TierCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TierMode" ADD CONSTRAINT "TierMode_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TierCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TierTier" ADD CONSTRAINT "TierTier_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "TierMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TierEntry" ADD CONSTRAINT "TierEntry_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "TierMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TierEntry" ADD CONSTRAINT "TierEntry_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "TierTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TierEntry" ADD CONSTRAINT "TierEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "TierItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

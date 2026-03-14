-- CreateTable
CREATE TABLE "GameImage" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameImage_gameId_idx" ON "GameImage"("gameId");

-- AddForeignKey
ALTER TABLE "GameImage" ADD CONSTRAINT "GameImage_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

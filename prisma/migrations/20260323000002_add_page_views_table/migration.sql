-- CreateTable
CREATE TABLE "PageView" (
    "id" SERIAL PRIMARY KEY,
    "pageId" INTEGER NOT NULL REFERENCES "Page"(id) ON DELETE CASCADE,
    "claimedById" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "PageView_pageId_idx" ON "PageView"("pageId");
CREATE INDEX "PageView_claimedById_idx" ON "PageView"("claimedById");
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

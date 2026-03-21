CREATE TABLE "PageImage" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "pageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PageImage_pageId_idx" ON "PageImage"("pageId");

ALTER TABLE "PageImage" ADD CONSTRAINT "PageImage_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

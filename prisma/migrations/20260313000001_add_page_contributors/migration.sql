-- CreateTable
CREATE TABLE "_PageContributors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PageContributors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PageContributors_B_index" ON "_PageContributors"("B");

-- AddForeignKey
ALTER TABLE "_PageContributors" ADD CONSTRAINT "_PageContributors_A_fkey" FOREIGN KEY ("A") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageContributors" ADD CONSTRAINT "_PageContributors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

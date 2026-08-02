-- DropIndex
DROP INDEX "Course_profId_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

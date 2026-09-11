-- CreateTable
CREATE TABLE "CourseFileCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "contentType" TEXT,
    "size" INTEGER,
    "updatedAt" DATETIME,
    CONSTRAINT "CourseFileCache_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CourseFileCache_subjectId_name_idx" ON "CourseFileCache"("subjectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseFileCache_provider_externalId_key" ON "CourseFileCache"("provider", "externalId");

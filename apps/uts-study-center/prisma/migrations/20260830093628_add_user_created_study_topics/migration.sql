-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudyTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 1,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "lastReviewed" DATETIME,
    "nextReviewAt" DATETIME,
    "userCreated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "StudyTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudyTopic" ("completion", "confidence", "id", "lastReviewed", "nextReviewAt", "notes", "subjectId", "title") SELECT "completion", "confidence", "id", "lastReviewed", "nextReviewAt", "notes", "subjectId", "title" FROM "StudyTopic";
DROP TABLE "StudyTopic";
ALTER TABLE "new_StudyTopic" RENAME TO "StudyTopic";
CREATE INDEX "StudyTopic_subjectId_nextReviewAt_idx" ON "StudyTopic"("subjectId", "nextReviewAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "sourceUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" DATETIME,
    "points" REAL,
    "weighting" REAL,
    "officialStatus" TEXT NOT NULL,
    "submissionState" TEXT,
    "htmlUrl" TEXT,
    "sourceUpdatedAt" DATETIME,
    CONSTRAINT "Assessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "workflowStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completion" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssessmentProgress_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnouncementCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "htmlUrl" TEXT,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "AnnouncementCache_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModuleCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "ModuleCache_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimetableEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fingerprint" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "subjectId" TEXT,
    "title" TEXT NOT NULL,
    "subjectCode" TEXT,
    "location" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "eventType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    CONSTRAINT "TimetableEvent_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 1,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "lastReviewed" DATETIME,
    "nextReviewAt" DATETIME,
    CONSTRAINT "StudyTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT,
    "topicId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lastAttemptedAt" DATETIME,
    "lastSuccessfulAt" DATETIME,
    "errorCode" TEXT,
    "errorMessage" TEXT
);

-- CreateTable
CREATE TABLE "AISummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceEntityType" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "sourceContentHash" TEXT NOT NULL,
    "outputLocale" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_key_key" ON "UserPreference"("key");

-- CreateIndex
CREATE INDEX "Subject_code_idx" ON "Subject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_provider_externalId_key" ON "Subject"("provider", "externalId");

-- CreateIndex
CREATE INDEX "Assessment_subjectId_dueAt_idx" ON "Assessment"("subjectId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_provider_externalId_key" ON "Assessment"("provider", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentProgress_assessmentId_key" ON "AssessmentProgress"("assessmentId");

-- CreateIndex
CREATE INDEX "AnnouncementCache_subjectId_publishedAt_idx" ON "AnnouncementCache"("subjectId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementCache_provider_externalId_key" ON "AnnouncementCache"("provider", "externalId");

-- CreateIndex
CREATE INDEX "ModuleCache_subjectId_position_idx" ON "ModuleCache"("subjectId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleCache_provider_externalId_key" ON "ModuleCache"("provider", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEvent_fingerprint_key" ON "TimetableEvent"("fingerprint");

-- CreateIndex
CREATE INDEX "TimetableEvent_startAt_endAt_idx" ON "TimetableEvent"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "TimetableEvent_subjectCode_idx" ON "TimetableEvent"("subjectCode");

-- CreateIndex
CREATE INDEX "StudyTopic_subjectId_nextReviewAt_idx" ON "StudyTopic"("subjectId", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_provider_entityType_key" ON "SyncState"("provider", "entityType");

-- CreateIndex
CREATE INDEX "AISummary_sourceEntityType_sourceEntityId_idx" ON "AISummary"("sourceEntityType", "sourceEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "AISummary_sourceEntityType_sourceEntityId_sourceContentHash_outputLocale_promptVersion_model_key" ON "AISummary"("sourceEntityType", "sourceEntityId", "sourceContentHash", "outputLocale", "promptVersion", "model");

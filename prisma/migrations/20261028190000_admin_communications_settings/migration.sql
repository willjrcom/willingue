CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "classroomId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "recipientCount" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX "Announcement_sentAt_createdAt_idx" ON "Announcement"("sentAt", "createdAt");

CREATE TABLE "SchoolSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolName" TEXT NOT NULL DEFAULT 'Willingue',
    "description" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "defaultLessonXp" INTEGER NOT NULL DEFAULT 30,
    "defaultLessonCoins" INTEGER NOT NULL DEFAULT 15,
    "updatedAt" DATETIME NOT NULL
);

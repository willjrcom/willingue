CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'STUDENT',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "StudentProfile" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "nickname" TEXT,
  "xp" INTEGER NOT NULL DEFAULT 0, "coins" INTEGER NOT NULL DEFAULT 0,
  "selectedAvatar" TEXT DEFAULT '🦊', "lastCompletedAt" DATETIME,
  CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

CREATE TABLE "LearningPath" (
  "id" TEXT NOT NULL PRIMARY KEY, "parentId" TEXT, "title" TEXT NOT NULL,
  "description" TEXT NOT NULL, "icon" TEXT NOT NULL DEFAULT '📚',
  "color" TEXT NOT NULL DEFAULT '#7062eb', "position" INTEGER NOT NULL DEFAULT 0,
  "access" TEXT NOT NULL DEFAULT 'PUBLIC', "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LearningPath_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "LearningPath_parentId_position_idx" ON "LearningPath"("parentId", "position");

CREATE TABLE "PathEnrollment" (
  "id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "pathId" TEXT NOT NULL,
  CONSTRAINT "PathEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PathEnrollment_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PathEnrollment_studentId_pathId_key" ON "PathEnrollment"("studentId", "pathId");

CREATE TABLE "Lesson" (
  "id" TEXT NOT NULL PRIMARY KEY, "pathId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT NOT NULL, "icon" TEXT NOT NULL DEFAULT '⭐',
  "position" INTEGER NOT NULL DEFAULT 0, "xpReward" INTEGER NOT NULL DEFAULT 30,
  "coinReward" INTEGER NOT NULL DEFAULT 15, "published" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Lesson_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Lesson_pathId_position_idx" ON "Lesson"("pathId", "position");

CREATE TABLE "Question" (
  "id" TEXT NOT NULL PRIMARY KEY, "lessonId" TEXT NOT NULL, "position" INTEGER NOT NULL DEFAULT 0,
  "kind" TEXT NOT NULL, "prompt" TEXT NOT NULL, "options" TEXT NOT NULL DEFAULT '[]',
  "answer" TEXT NOT NULL, "explanation" TEXT,
  CONSTRAINT "Question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Question_lessonId_position_idx" ON "Question"("lessonId", "position");

CREATE TABLE "LessonCompletion" (
  "id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "lessonId" TEXT NOT NULL,
  "score" INTEGER NOT NULL, "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LessonCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LessonCompletion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "LessonCompletion_studentId_lessonId_key" ON "LessonCompletion"("studentId", "lessonId");

CREATE TABLE "LessonAttempt" (
  "id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "lessonId" TEXT NOT NULL,
  "score" INTEGER NOT NULL, "correct" INTEGER NOT NULL, "total" INTEGER NOT NULL,
  "passed" BOOLEAN NOT NULL, "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LessonAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LessonAttempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "LessonAttempt_studentId_lessonId_idx" ON "LessonAttempt"("studentId", "lessonId");

CREATE TABLE "Reward" (
  "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL, "category" TEXT NOT NULL, "price" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true, "position" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE "RewardRedemption" (
  "id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "rewardId" TEXT NOT NULL,
  "redeemedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RewardRedemption_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RewardRedemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RewardRedemption_studentId_rewardId_key" ON "RewardRedemption"("studentId", "rewardId");

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "message" TEXT NOT NULL, "href" TEXT NOT NULL DEFAULT '/aprender',
  "readAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

CREATE TABLE "Activity" (
  "id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "lessonId" TEXT NOT NULL,
  "dueAt" DATETIME NOT NULL, "completedAt" DATETIME,
  CONSTRAINT "Activity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Activity_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Activity_studentId_dueAt_idx" ON "Activity"("studentId", "dueAt");

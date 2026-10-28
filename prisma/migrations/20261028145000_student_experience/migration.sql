-- Non-destructive migration: existing student progress and settings are preserved.
ALTER TABLE "StudentProfile" ADD COLUMN "birthDate" DATETIME;
ALTER TABLE "StudentProfile" ADD COLUMN "interfaceMode" TEXT NOT NULL DEFAULT 'AUTO';

CREATE TABLE "GuardianStudent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guardianId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "financialResponsible" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuardianStudent_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GuardianStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "GuardianStudent_guardianId_studentId_key" ON "GuardianStudent"("guardianId","studentId");
CREATE INDEX "GuardianStudent_studentId_guardianId_idx" ON "GuardianStudent"("studentId","guardianId");

CREATE TABLE "Charge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "dueAt" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "paidAt" DATETIME,
  "payerType" TEXT NOT NULL DEFAULT 'GUARDIAN',
  "payerGuardianId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Charge_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Charge_payerGuardianId_fkey" FOREIGN KEY ("payerGuardianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Charge_studentId_dueAt_idx" ON "Charge"("studentId","dueAt");
CREATE INDEX "Charge_status_dueAt_idx" ON "Charge"("status","dueAt");

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadStudentLearning } from "@/lib/learning";

export async function requireGuardian() {
  const user = await currentUser();
  if (!user || user.role !== "GUARDIAN") redirect("/login");
  return user;
}
export function guardianChildren(guardianId: string) {
  return db.guardianStudent.findMany({
    where: { guardianId },
    include: { student: { include: { user: { select: { name: true } },
      classrooms: { include: { classroom: { select: { name: true } } } } } } },
    orderBy: { createdAt: "asc" },
  });
}
export async function linkedStudent(guardianId: string, studentId: string) {
  return db.guardianStudent.findUnique({
    where: { guardianId_studentId: { guardianId, studentId } },
    include: { student: { include: { user: { select: { name: true } },
      classrooms: { include: { classroom: { select: { name: true } } } } } } },
  });
}
export async function childOverview(studentId: string) {
  const since = new Date(Date.now() - 7 * 86400000);
  const [learning, recent, recentWeekCount, activity] = await Promise.all([
    loadStudentLearning(studentId),
    db.lessonCompletion.findMany({ where: { studentId },
      include: { lesson: { select: { title: true, icon: true } } },
      orderBy: { completedAt: "desc" }, take: 6 }),
    db.lessonCompletion.count({ where: { studentId, completedAt: { gte: since } } }),
    db.activity.findMany({ where: { studentId, completedAt: null },
      include: { lesson: { select: { title: true, icon: true } } },
      orderBy: { dueAt: "asc" }, take: 8 }),
  ]);
  const total = learning.roots.reduce((sum, path) => sum + path.total, 0);
  const completed = learning.roots.reduce((sum, path) => sum + path.completed, 0);
  const percent = total ? Math.round(completed / total * 100) : 0;
  const activityText = recentWeekCount > 0
    ? `${recentWeekCount} ${recentWeekCount === 1 ? "lição concluída" : "lições concluídas"} nos últimos 7 dias`
    : completed > 0 ? "Nenhuma lição concluída nos últimos 7 dias"
      : "Ainda não iniciou as lições disponíveis";
  return { learning, total, completed, percent, recent, recentWeekCount, activity, activityText };
}

import type { LearningPath, Lesson, LessonCompletion, PathEnrollment } from "@prisma/client";
import { db } from "@/lib/db";

export type TrailNode = {
  id: string; title: string; description: string; icon: string; color: string;
  total: number; completed: number; percent: number; children: TrailNode[];
  lessons: Array<{ id: string; title: string; description: string; icon: string; xpReward: number; coinReward: number; done: boolean }>;
};

export async function loadStudentLearning(studentId: string) {
  const [paths, lessons, completions, enrollments] = await Promise.all([
    db.learningPath.findMany({ where: { published: true }, orderBy: [{ position: "asc" }, { title: "asc" }] }),
    db.lesson.findMany({ where: { published: true, path: { published: true } }, orderBy: [{ position: "asc" }, { title: "asc" }] }),
    db.lessonCompletion.findMany({ where: { studentId } }),
    db.pathEnrollment.findMany({ where: { studentId } }),
  ]);
  const byId = new Map(paths.map(p => [p.id, p]));
  const granted = new Set(enrollments.map(e => e.pathId));
  const allowed = new Set<string>();

  function hasAccess(path: LearningPath) {
    let cursor: LearningPath | undefined = path;
    let grantedByAncestor = false;
    const visited = new Set<string>();
    while (cursor && !visited.has(cursor.id)) {
      visited.add(cursor.id);
      if (granted.has(cursor.id)) grantedByAncestor = true;
      cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
    }
    cursor = path;
    visited.clear();
    while (cursor && !visited.has(cursor.id)) {
      visited.add(cursor.id);
      if (cursor.access === "ASSIGNED" && !grantedByAncestor) return false;
      cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
    }
    return true;
  }
  for (const path of paths) if (hasAccess(path)) allowed.add(path.id);
  const visibleLessons = lessons.filter(l => allowed.has(l.pathId));
  const done = new Set(completions.map(c => c.lessonId));
  const byParent = new Map<string | null, LearningPath[]>();
  for (const path of paths) {
    if (!allowed.has(path.id)) continue;
    const key = path.parentId && allowed.has(path.parentId) ? path.parentId : null;
    byParent.set(key, [...(byParent.get(key) ?? []), path]);
  }
  const lessonsByPath = new Map<string, Lesson[]>();
  for (const lesson of visibleLessons) lessonsByPath.set(lesson.pathId, [...(lessonsByPath.get(lesson.pathId) ?? []), lesson]);
  const visited = new Set<string>();
  function make(path: LearningPath): TrailNode {
    if (visited.has(path.id)) throw new Error("Ciclo de trilhas detectado");
    visited.add(path.id);
    const children = (byParent.get(path.id) ?? []).map(make);
    const localLessons = (lessonsByPath.get(path.id) ?? []).map(l => ({
      id: l.id, title: l.title, description: l.description, icon: l.icon,
      xpReward: l.xpReward, coinReward: l.coinReward, done: done.has(l.id),
    }));
    const total = localLessons.length + children.reduce((sum, c) => sum + c.total, 0);
    const completed = localLessons.filter(l => l.done).length + children.reduce((sum, c) => sum + c.completed, 0);
    return { id: path.id, title: path.title, description: path.description,
      icon: path.icon, color: path.color, total, completed,
      percent: total ? Math.round(completed / total * 100) : 0, children, lessons: localLessons };
  }
  const roots = (byParent.get(null) ?? []).map(make);
  return { roots, completedLessonIds: done, allowedPathIds: allowed, lessons: visibleLessons };
}

export function findTrail(nodes: TrailNode[], id: string): TrailNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const child = findTrail(n.children, id);
    if (child) return child;
  }
  return null;
}

export function findTrailBreadcrumbs(nodes: TrailNode[], id: string, parents: TrailNode[] = []): TrailNode[] | null {
  for (const node of nodes) {
    if (node.id === id) return [...parents, node];
    const child = findTrailBreadcrumbs(node.children, id, [...parents, node]);
    if (child) return child;
  }
  return null;
}

export function levelForXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const current = 100 * (level - 1) ** 2;
  const next = 100 * level ** 2;
  return { level, progress: Math.round((xp - current) / (next - current) * 100), nextXp: next };
}

export function lessonCompleted(lessonId: string, completions: LessonCompletion[]) {
  return completions.some(c => c.lessonId === lessonId);
}

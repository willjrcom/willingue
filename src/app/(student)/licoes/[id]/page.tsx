import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadStudentLearning } from "@/lib/learning";
import { LessonPlayer } from "@/components/lesson-player";

export async function generateMetadata() { return { title: "Praticar inglês" }; }
export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { student } = await requireStudent();
  const { id } = await params;
  const lesson = await db.lesson.findUnique({ where: { id }, include: { questions: { orderBy: { position: "asc" } } } });
  if (!lesson?.published || !lesson.questions.length) notFound();
  const learning = await loadStudentLearning(student.id);
  if (!learning.allowedPathIds.has(lesson.pathId) || !learning.lessons.some(l => l.id === id)) notFound();
  return <LessonPlayer key={lesson.id} backHref={`/trilhas/${lesson.pathId}`} completed={learning.completedLessonIds.has(lesson.id)} lesson={{
    id: lesson.id, title: lesson.title, description: lesson.description, icon: lesson.icon,
    xpReward: lesson.xpReward, coinReward: lesson.coinReward,
    questions: lesson.questions.map(q => ({ id: q.id, kind: q.kind, prompt: q.prompt, options: JSON.parse(q.options) })),
  }}/>;
}

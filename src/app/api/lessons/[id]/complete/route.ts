import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiStudent, jsonError } from "@/lib/api";
import { gradeQuestion } from "@/lib/grading";
import { loadStudentLearning } from "@/lib/learning";

const schema = z.object({ answers: z.array(z.object({ questionId: z.string(), value: z.union([z.string(), z.array(z.string())]) })).max(100) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getApiStudent();
  if (!context) return jsonError("Sessão expirada.", 401);
  const { id } = await params;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Respostas inválidas.");
  const lesson = await db.lesson.findUnique({ where: { id }, include: { questions: { orderBy: { position: "asc" } } } });
  if (!lesson || !lesson.published || !lesson.questions.length) return jsonError("Lição indisponível.", 404);
  const learning = await loadStudentLearning(context.student.id);
  if (!learning.allowedPathIds.has(lesson.pathId) || !learning.lessons.some(l => l.id === lesson.id)) return jsonError("Lição indisponível.", 403);
  const answers = new Map(input.data.answers.map(a => [a.questionId, a.value]));
  const correct = lesson.questions.filter(q => gradeQuestion(q, answers.get(q.id))).length;
  const total = lesson.questions.length;
  const score = Math.round(correct / total * 100);
  const passed = score >= 70;
  const already = await db.lessonCompletion.findUnique({ where: { studentId_lessonId: { studentId: context.student.id, lessonId: id } } });
  const firstTime = passed && !already;
  try {
    await db.$transaction(async tx => {
      await tx.lessonAttempt.create({ data: { studentId: context.student.id, lessonId: id, correct, total, score, passed } });
      if (firstTime) {
        await tx.lessonCompletion.create({ data: { studentId: context.student.id, lessonId: id, score } });
        await tx.studentProfile.update({ where: { id: context.student.id }, data: {
          xp: { increment: lesson.xpReward }, coins: { increment: lesson.coinReward }, lastCompletedAt: new Date(),
        } });
        await tx.activity.updateMany({ where: { studentId: context.student.id, lessonId: id, completedAt: null }, data: { completedAt: new Date() } });
        await tx.notification.create({ data: { userId: context.user.id, title: "Você conseguiu! 🎉", message: `Você ganhou ${lesson.xpReward} XP e ${lesson.coinReward} moedas por ${lesson.title}.`, href: "/rewards" } });
      }
    });
  } catch (error) {
    // A second simultaneous submission may lose the unique-completion race. Never award twice.
    if (firstTime && typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ score, correct, total, passed, earnedXp: 0, earnedCoins: 0, alreadyCompleted: true });
    }
    throw error;
  }
  return NextResponse.json({ score, correct, total, passed, earnedXp: firstTime ? lesson.xpReward : 0,
    earnedCoins: firstTime ? lesson.coinReward : 0, alreadyCompleted: Boolean(already) });
}

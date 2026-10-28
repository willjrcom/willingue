import { z } from "zod";
import { db } from "@/lib/db";

export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(110),
  message: z.string().trim().min(5).max(1800),
  audience: z.enum(["ALL", "STUDENTS", "GUARDIANS", "CLASSROOM"]),
  classroomId: z.string().min(1).max(120).nullable(),
}).strict().refine(value => value.audience !== "CLASSROOM" || !!value.classroomId,
  "Escolha a turma para este comunicado.");

export const audienceLabels: Record<string, string> = {
  ALL: "Todos os alunos e responsáveis",
  STUDENTS: "Todos os alunos",
  GUARDIANS: "Todos os responsáveis",
  CLASSROOM: "Alunos de uma turma",
};

export async function announcementRecipients(audience: string, classroomId: string | null): Promise<Array<{userId:string;role:"STUDENT"|"GUARDIAN"}>> {
  if (audience === "CLASSROOM") {
    if (!classroomId) throw new Error("Selecione uma turma.");
    const classroom = await db.classroom.findFirst({ where: { id: classroomId, active: true },
      select: { id: true } });
    if (!classroom) throw new Error("Turma não encontrada ou inativa.");
    const members = await db.classroomMember.findMany({
      where: { classroomId }, select: { student: { select: { userId: true } } },
    });
    return members.map(item => ({userId:item.student.userId,role:"STUDENT" as const}));
  }
  const roles = audience === "STUDENTS" ? ["STUDENT"] :
    audience === "GUARDIANS" ? ["GUARDIAN"] : ["STUDENT","GUARDIAN"];
  const users = await db.user.findMany({ where: { role: { in: roles } },
    select: { id:true,role:true,email:true } });
  return users.filter(user => process.env.DEMO_SEED === "true"
    || !["aluno@willingue.app","responsavel@willingue.app"].includes(user.email))
    .map(user => ({userId:user.id,role:user.role === "STUDENT" ? "STUDENT" as const:"GUARDIAN" as const}));
}

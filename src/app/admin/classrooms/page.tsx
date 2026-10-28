import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { ClassroomManager } from "@/components/classroom-manager";

export const metadata = { title: "Gerenciar turmas" };

export default async function AdminClassesPage() {
  const [classes, students] = await Promise.all([
    db.classroom.findMany({
      include: {
        members: {
          include: {
            student: { include: { user: { select: { name: true, email: true } } } },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    }),
    db.studentProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);
  const serializeStudent = (profile: (typeof students)[number]) => ({
    id: profile.id,
    name: profile.user.name,
    nickname: profile.nickname || profile.user.name.split(/\s+/)[0],
    email: profile.user.email,
    avatar: profile.selectedAvatar || "🎓",
  });
  const allStudents = students.map(serializeStudent);
  const classrooms = classes.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    active: item.active,
    members: item.members.map(m => ({
      id: m.studentId,
      name: m.student.user.name,
      nickname: m.student.nickname || m.student.user.name.split(/\s+/)[0],
      email: m.student.user.email,
      avatar: m.student.selectedAvatar || "🎓",
    })),
  }));
  return <div className="admin-content">

      <div className="admin-page-heading"><div><p className="admin-eyebrow">GESTÃO ESCOLAR</p>
        <h1>Turmas</h1><p>Consulte turmas, alunos vinculados e rankings. Crie uma turma quando precisar.</p></div>
        <Link className="admin-action-primary" href="/admin/classrooms/new"><Plus size={17}/> Nova turma</Link>
      </div>
      <ClassroomManager classrooms={classrooms} students={allStudents}/>

  </div>;
}

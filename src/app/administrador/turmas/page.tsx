import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/logout-button";
import { ClassroomManager } from "@/components/classroom-manager";

export const metadata = { title: "Gerenciar turmas" };

export default async function AdminClassesPage() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
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
  return <main className="admin-page">
    <header className="admin-header">
      <Link className="admin-brand" href="/administrador"><Sparkles size={26}/> Willingue<span>.</span></Link>
      <LogoutButton/>
    </header>
    <div className="admin-container">
      <Link className="admin-back" href="/administrador"><ArrowLeft size={17}/> Voltar para administração</Link>
      <div className="admin-intro">
        <p className="eyebrow muted">GESTÃO ESCOLAR</p>
        <h1>Turmas e alunos</h1>
        <p>Organize os participantes e acompanhe a competição por lições concluídas.</p>
      </div>
      <ClassroomManager classrooms={classrooms} students={allStudents}/>
    </div>
  </main>;
}

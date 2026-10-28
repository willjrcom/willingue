import Link from "next/link";
import { ArrowRight, GraduationCap, Mail, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { AdminStudentList } from "@/components/admin-student-list";

export const metadata = { title: "Alunos" };
export default async function AdminStudentsPage() {
  const students = await db.studentProfile.findMany({
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      classrooms: { include: { classroom: { select: { name: true } } } },
      guardianLinks: { include: { guardian: { select: { name: true } } } },
      _count: { select: { completions: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
  return <div className="admin-content">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">GESTÃO ACADÊMICA</p>
      <h1>Alunos</h1><p>Gerencie os cadastros, vínculos e desempenho de cada estudante.</p></div>
      <Link className="admin-action-primary" href="/administrador/alunos/novo"><GraduationCap size={17}/> Cadastrar aluno <ArrowRight size={17}/></Link>
    </div>
    <div className="admin-dash-insights">
      <div><span><GraduationCap size={21}/></span><strong>{students.length}</strong><small>Alunos cadastrados</small></div>
      <div><span><UsersRound size={21}/></span><strong>{students.filter(s => s.classrooms.length).length}</strong><small>Vinculados a turmas</small></div>
      <div><span><Mail size={21}/></span><strong>{students.filter(s => s.guardianLinks.length).length}</strong><small>Com responsáveis</small></div>
      <div><span><GraduationCap size={21}/></span><strong>{students.filter(s => s._count.completions > 0).length}</strong><small>Com lições concluídas</small></div>
    </div>
    <AdminStudentList students={students.map(s => ({
      id: s.id, name: s.user.name, nickname: s.nickname || "", email: s.user.email,
      avatar: s.selectedAvatar || "🎓", ageMode: s.interfaceMode, xp: s.xp,
      completed: s._count.completions, classes: s.classrooms.map(c=>c.classroom.name),
      guardians: s.guardianLinks.map(l=>l.guardian.name),
    }))}/>
  </div>;
}

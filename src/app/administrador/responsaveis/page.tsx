import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/logout-button";
import { GuardianManager } from "@/components/guardian-manager";

export const metadata = { title: "Gerenciar responsáveis" };

export default async function AdminGuardiansPage() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  const [guardians, students] = await Promise.all([
    db.user.findMany({
      where: { role: "GUARDIAN" },
      include: { guardianLinks: { include: { student: { include: {
        user: { select: { name: true } },
      } } } } },
      orderBy: { name: "asc" },
    }),
    db.studentProfile.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);
  return <main className="admin-page">
    <header className="admin-header">
      <Link className="admin-brand" href="/administrador"><Sparkles size={26}/> Willingue<span>.</span></Link>
      <LogoutButton/>
    </header>
    <div className="admin-container">
      <Link href="/administrador" className="admin-back"><ArrowLeft size={17}/> Voltar para administração</Link>
      <div className="admin-intro"><p className="eyebrow muted">GESTÃO FAMILIAR</p><h1>Responsáveis</h1>
        <p>Crie acessos e vincule um ou vários responsáveis a cada aluno.</p></div>
      <GuardianManager
        students={students.map(s => ({ id: s.id, name: s.nickname || s.user.name }))}
        guardians={guardians.map(g => ({
          id: g.id, name: g.name, email: g.email,
          links: g.guardianLinks.map(l => ({
            studentId: l.studentId,
            name: l.student.nickname || l.student.user.name,
            financialResponsible: l.financialResponsible,
          })),
        }))}
      />
    </div>
  </main>;
}

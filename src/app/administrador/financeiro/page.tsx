import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/logout-button";
import { AdminFinanceManager } from "@/components/admin-finance-manager";

export const metadata = { title: "Financeiro escolar" };
export default async function AdminFinancePage() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  const [students, charges] = await Promise.all([
    db.studentProfile.findMany({
      include: {
        user: { select: { name: true } },
        guardianLinks: { include: { guardian: { select: { name: true, role: true } } } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    db.charge.findMany({
      include: {
        student: { include: { user: { select: { name: true } } } },
        payerGuardian: { select: { name: true } },
      },
      orderBy: [{ dueAt: "desc" }, { createdAt: "desc" }],
      take: 150,
    }),
  ]);
  return <main className="admin-page">
    <header className="admin-header">
      <Link className="admin-brand" href="/administrador"><Sparkles size={26}/> Willingue<span>.</span></Link>
      <LogoutButton/>
    </header>
    <div className="admin-container">
      <Link href="/administrador" className="admin-back"><ArrowLeft size={17}/> Voltar para administração</Link>
      <div className="admin-intro"><p className="eyebrow muted">CONTROLE DE COBRANÇAS</p><h1>Financeiro</h1>
        <p>Cadastre mensalidades, selecione o pagante e registre pagamentos manualmente.</p></div>
      <AdminFinanceManager students={students.map(s => ({
        id: s.id, name: s.nickname || s.user.name,
        guardians: s.guardianLinks.filter(l => l.guardian.role === "GUARDIAN").map(l => ({
          id: l.guardianId, name: l.guardian.name, preferred: l.financialResponsible,
        })),
      }))} charges={charges.map(c => ({
        id: c.id, studentName: c.student.nickname || c.student.user.name,
        title: c.title, amountCents: c.amountCents, dueAt: c.dueAt.toISOString(),
        status: c.status, paidAt: c.paidAt?.toISOString() ?? null,
        payerLabel: c.payerType === "STUDENT" ? "Aluno" :
          (c.payerGuardian?.name || "Responsável financeiro"),
      }))}/>
    </div>
  </main>;
}

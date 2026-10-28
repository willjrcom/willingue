import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { AdminFinanceManager } from "@/components/admin-finance-manager";

export const metadata = { title: "Financeiro escolar" };
export default async function AdminFinancePage() {
  const charges = await db.charge.findMany({
    include: {
      student: { include: { user: { select: { name: true } } } },
      payerGuardian: { select: { name: true } },
    },
    orderBy: [{ dueAt: "desc" }, { createdAt: "desc" }],
    take: 150,
  });
  return <div className="admin-content">

      <div className="admin-page-heading"><div><p className="admin-eyebrow">CONTROLE DE COBRANÇAS</p>
        <h1>Financeiro</h1><p>Acompanhe mensalidades, vencimentos e pagamentos registrados pela escola.</p></div>
        <Link className="admin-action-primary" href="/administrador/financeiro/nova"><Plus size={17}/> Nova cobrança</Link>
      </div>
      <AdminFinanceManager charges={charges.map(c => ({
        id: c.id, studentName: c.student.nickname || c.student.user.name,
        title: c.title, amountCents: c.amountCents, dueAt: c.dueAt.toISOString(),
        status: c.status, paidAt: c.paidAt?.toISOString() ?? null,
        payerLabel: c.payerType === "STUDENT" ? "Aluno" :
          (c.payerGuardian?.name || "Responsável financeiro"),
      }))}/>

  </div>;
}

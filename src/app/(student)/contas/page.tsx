import Link from "next/link";
import { ArrowLeft, CreditCard, Wallet, CheckCircle2, AlertTriangle } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { chargeStatus, formatMoney, sumCharges } from "@/lib/finance";
import { ChargeList } from "@/components/charge-list";

export const metadata = { title: "Minhas contas" };
export default async function StudentAccounts() {
  const { student } = await requireStudent();
  const charges = await db.charge.findMany({
    where: { studentId: student.id },
    include: { payerGuardian: { select: { name: true } } },
    orderBy: { dueAt: "desc" },
  });
  const open = charges.filter(c => ["PENDING", "OVERDUE"].includes(chargeStatus(c)));
  const paid = charges.filter(c => chargeStatus(c) === "PAID");
  const overdue = charges.filter(c => chargeStatus(c) === "OVERDUE");
  return <div className="page-stack">
    <Link className="back-link" href="/perfil"><ArrowLeft size={18}/> Voltar ao perfil</Link>
    <div className="page-title"><p className="eyebrow muted">PAGAMENTOS ESCOLARES</p>
      <h1>Minhas contas <CreditCard size={26} style={{ verticalAlign: "middle" }}/></h1>
      <p>Acompanhe vencimentos e pagamentos registrados pela escola.</p></div>
    <div className="guardian-metrics student-finance-metrics">
      <div><Wallet size={23}/><strong className="guardian-money">{formatMoney(sumCharges(open))}</strong><span>Em aberto</span></div>
      <div><AlertTriangle size={23}/><strong>{overdue.length}</strong><span>Atrasadas</span></div>
      <div><CheckCircle2 size={23}/><strong>{paid.length}</strong><span>Pagas</span></div>
    </div>
    <section className="guardian-section">
      <div className="guardian-section-title"><div><p className="guardian-eyebrow">SITUAÇÃO FINANCEIRA</p>
        <h2>Histórico de cobranças</h2></div></div>
      <ChargeList charges={charges.map(c => ({
        id: c.id, title: c.title, amountCents: c.amountCents,
        dueAt: c.dueAt, status: c.status, paidAt: c.paidAt,
        payerLabel: c.payerType === "STUDENT" ? "Você" :
          (c.payerGuardian ? "Responsável: " + c.payerGuardian.name : "Responsável financeiro"),
      }))}/>
      <p className="guardian-footnote">Esta área é informativa. A escola controla manualmente os pagamentos.</p>
    </section>
  </div>;
}

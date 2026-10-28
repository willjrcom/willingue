import Link from "next/link";
import { CreditCard, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { requireGuardian, guardianChildren } from "@/lib/guardian";
import { db } from "@/lib/db";
import { chargeStatus, formatMoney, sumCharges } from "@/lib/finance";
import { ChargeList } from "@/components/charge-list";

export const metadata = { title: "Financeiro" };
export default async function GuardianFinance({ searchParams }: {
  searchParams: Promise<{ status?: string; aluno?: string }>;
}) {
  const guardian = await requireGuardian();
  const children = await guardianChildren(guardian.id);
  const params = await searchParams;
  const childIds = children.map(link => link.studentId);
  const selectedStudent = typeof params.aluno === "string" && childIds.includes(params.aluno) ? params.aluno : "todos";
  const filter = ["todas", "pendentes", "pagas", "atrasadas"].includes(params.status ?? "")
    ? params.status! : "todas";
  const charges = childIds.length ? await db.charge.findMany({
    where: { studentId: { in: selectedStudent === "todos" ? childIds : [selectedStudent] } },
    include: { student: { include: { user: { select: { name: true } } } },
      payerGuardian: { select: { name: true } } },
    orderBy: [{ dueAt: "desc" }, { createdAt: "desc" }],
  }) : [];
  const visible = charges.filter(charge => {
    const status = chargeStatus(charge);
    return filter === "todas" || (filter === "pagas" && status === "PAID")
      || (filter === "atrasadas" && status === "OVERDUE")
      || (filter === "pendentes" && (status === "PENDING" || status === "OVERDUE"));
  });
  const openCharges = charges.filter(charge => ["PENDING", "OVERDUE"].includes(chargeStatus(charge)));
  const overdue = charges.filter(charge => chargeStatus(charge) === "OVERDUE");
  const paid = charges.filter(charge => chargeStatus(charge) === "PAID");
  const link = (status: string, aluno: string) =>
    `/guardian/finance?status=${encodeURIComponent(status)}&aluno=${encodeURIComponent(aluno)}`;

  return <div className="guardian-stack">
    <div className="guardian-page-title"><p className="guardian-eyebrow">GESTÃO FINANCEIRA</p><h1>Financeiro</h1>
      <p>Consulte as mensalidades e os registros de pagamento vinculados aos alunos que você acompanha.</p></div>
    <div className="guardian-metrics">
      <div><Wallet size={23}/><strong className="guardian-money">{formatMoney(sumCharges(openCharges))}</strong><span>Total em aberto</span></div>
      <div><AlertCircle size={23}/><strong>{overdue.length}</strong><span>Cobranças atrasadas</span></div>
      <div><CheckCircle2 size={23}/><strong>{paid.length}</strong><span>Pagamentos registrados</span></div>
    </div>
    {children.length > 1 && <div className="guardian-filter-pills" aria-label="Filtrar por aluno">
      <Link href={link(filter, "todos")} className={selectedStudent === "todos" ? "active" : ""}>Todos</Link>
      {children.map(item => <Link href={link(filter, item.studentId)} key={item.id}
        className={selectedStudent === item.studentId ? "active" : ""}>{item.student.nickname || item.student.user.name}</Link>)}
    </div>}
    <section className="guardian-section">
      <div className="guardian-section-title"><div><p className="guardian-eyebrow">MENSALIDADES E DESPESAS</p>
        <h2>Contas da escola</h2></div><CreditCard size={23}/></div>
      <div className="guardian-filter-pills" aria-label="Situação das cobranças">
        {([["todas","Todas"],["pendentes","Em aberto"],["pagas","Pagas"],["atrasadas","Atrasadas"]] as const).map(([key, label]) =>
          <Link key={key} href={link(key, selectedStudent)} className={filter === key ? "active" : ""}>{label}</Link>)}
      </div>
      <ChargeList charges={visible.map(charge => ({
        id: charge.id, title: charge.title, amountCents: charge.amountCents, dueAt: charge.dueAt,
        status: charge.status, paidAt: charge.paidAt,
        studentName: charge.student.nickname || charge.student.user.name,
        payerLabel: charge.payerType === "STUDENT" ? "Aluno" :
          charge.payerGuardian ? charge.payerGuardian.name : "Responsável financeiro",
      }))}/>
      <p className="guardian-footnote">Os pagamentos são registrados manualmente pela escola. Este painel não processa Pix, cartão ou boleto.</p>
    </section>
  </div>;
}

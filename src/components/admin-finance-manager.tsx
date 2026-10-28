"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Plus } from "lucide-react";
import { readApiJson } from "@/lib/api-client";
import { chargeStatus, formatMoney, formatDueDate } from "@/lib/finance";

type Student = { id: string; name: string;
  guardians: Array<{ id: string; name: string; preferred: boolean }> };
type Charge = { id: string; studentName: string; title: string; amountCents: number; dueAt: string;
  status: string; paidAt: string | null; payerLabel: string };
type Status = "PENDING" | "PAID" | "CANCELED";

export function AdminFinanceManager({ students, charges }: { students: Student[]; charges: Charge[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("Mensalidade de inglês");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [payerType, setPayerType] = useState<"STUDENT" | "GUARDIAN">("GUARDIAN");
  const [payerGuardianId, setPayerGuardianId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{ id: string; title: string; status: Status } | null>(null);
  const student = students.find(s => s.id === studentId);
  const guardians = student?.guardians || [];
  const effectivePayer = guardians.some(g => g.id === payerGuardianId)
    ? payerGuardianId : guardians.find(g => g.preferred)?.id || guardians[0]?.id || null;

  async function request(url: string, method: "POST" | "PATCH", payload: object, success: string) {
    if (busy) return false;
    setBusy(true); setNotice(""); setError("");
    try {
      const response = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await readApiJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      setNotice(success); router.refresh();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
      return false;
    } finally { setBusy(false); }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await request("/api/admin/charges", "POST", {
      studentId, title, amount, dueDate, payerType,
      payerGuardianId: payerType === "GUARDIAN" ? effectivePayer : null,
    }, "Cobrança criada e notificações enviadas.");
    if (ok) { setAmount(""); setDueDate(""); }
  }
  async function confirm() {
    if (!confirmation) return;
    const result = await request(`/api/admin/charges/${encodeURIComponent(confirmation.id)}`,
      "PATCH", { status: confirmation.status }, "Situação atualizada e notificações enviadas.");
    if (result) setConfirmation(null);
  }
  return <div className="admin-management">
    {notice && <p className="admin-feedback" role="status"><CheckCircle2 size={17}/> {notice}</p>}
    {error && <p className="admin-feedback error" role="alert">{error}</p>}
    <form className="admin-form-card admin-finance-form" onSubmit={create}>
      <h2><CreditCard size={22}/> Nova cobrança</h2>
      <p>Registre uma cobrança informativa. Os pagamentos são confirmados manualmente pela escola.</p>
      <div className="admin-fields">
        <label className="admin-field">Aluno
          <select required value={studentId} onChange={e => { setStudentId(e.target.value); setPayerGuardianId(""); }}>
            <option value="">Selecione</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="admin-field">Descrição
          <input required minLength={3} maxLength={120} value={title} onChange={e => setTitle(e.target.value)}/>
        </label>
        <label className="admin-field">Valor em reais
          <input required inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="189,90"/>
        </label>
        <label className="admin-field">Vencimento
          <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}/>
        </label>
        <label className="admin-field">Quem é o pagante?
          <select value={payerType} onChange={e => setPayerType(e.target.value as "STUDENT" | "GUARDIAN")}>
            <option value="GUARDIAN">Responsável</option>
            <option value="STUDENT">O próprio aluno</option>
          </select>
        </label>
        {payerType === "GUARDIAN" && <label className="admin-field">Responsável financeiro
          <select required value={effectivePayer || ""} onChange={e => setPayerGuardianId(e.target.value)}
            disabled={guardians.length === 0}>
            {!guardians.length && <option value="">Vincule um responsável primeiro</option>}
            {guardians.map(g => <option key={g.id} value={g.id}>
              {g.name}{g.preferred ? " · preferencial" : ""}
            </option>)}
          </select>
        </label>}
      </div>
      <button className="primary-button" type="submit"
        disabled={busy || !studentId || (payerType === "GUARDIAN" && !effectivePayer)}>
        <Plus size={18}/> Cadastrar cobrança
      </button>
    </form>
    <section className="section-block">
      <div className="section-heading"><h2>Cobranças cadastradas</h2>
        <span className="heading-counter">{charges.length}{charges.length >= 150 ? "+" : ""}</span></div>
      <div className="admin-finance-list">
        {charges.map(charge => {
          const status = chargeStatus({ status: charge.status, dueAt: new Date(charge.dueAt) });
          const label = status === "PAID" ? "Pago" : status === "OVERDUE" ? "Atrasado"
            : status === "CANCELED" ? "Cancelado" : "A vencer";
          return <article className="admin-finance-item" key={charge.id}>
            <div className="admin-finance-info">
              <strong>{charge.title}</strong><span>{charge.studentName} · {charge.payerLabel}</span>
              <small>Vencimento: {formatDueDate(new Date(charge.dueAt))}</small>
            </div>
            <div className="admin-finance-amount"><strong>{formatMoney(charge.amountCents)}</strong>
              <span className={`finance-status finance-status-${status.toLowerCase()}`}>{label}</span></div>
            <div className="admin-finance-actions">
              {charge.status !== "PAID" && <button type="button" className="admin-minor"
                onClick={() => setConfirmation({ id: charge.id, title: charge.title, status: "PAID" })}>
                Marcar como pago</button>}
              {charge.status !== "PENDING" && <button type="button" className="admin-minor"
                onClick={() => setConfirmation({ id: charge.id, title: charge.title, status: "PENDING" })}>
                Reabrir</button>}
              {charge.status !== "CANCELED" && <button type="button" className="admin-minor danger"
                onClick={() => setConfirmation({ id: charge.id, title: charge.title, status: "CANCELED" })}>
                Cancelar</button>}
            </div>
          </article>;
        })}
        {charges.length === 0 && <div className="empty-card">Nenhuma cobrança cadastrada.</div>}
      </div>
    </section>
    {confirmation && <div className="admin-dialog-backdrop">
      <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="change-charge-title">
        <h2 id="change-charge-title">Alterar situação?</h2>
        <p>Registrar "{confirmation.title}" como {confirmation.status === "PAID" ? "paga" :
          confirmation.status === "CANCELED" ? "cancelada" : "pendente"}? Os alunos e responsáveis serão notificados.</p>
        <div className="admin-dialog-actions">
          <button type="button" disabled={busy} onClick={() => setConfirmation(null)}>Voltar</button>
          <button type="button" disabled={busy} className="primary-button" onClick={confirm}>
            {busy ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

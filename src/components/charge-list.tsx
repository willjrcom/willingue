import { CheckCircle2, Clock3, AlertCircle, Ban } from "lucide-react";
import { chargeStatus, formatDueDate, formatMoney } from "@/lib/finance";

export type ChargeView = {
  id: string; title: string; amountCents: number; dueAt: Date; status: string;
  paidAt: Date | null; studentName?: string;
  payerLabel: string;
};
export function ChargeList({ charges, emptyText = "Nenhuma cobrança encontrada." }: {
  charges: ChargeView[]; emptyText?: string;
}) {
  if (charges.length === 0) return <div className="finance-empty">{emptyText}</div>;
  return <div className="finance-charge-list">
    {charges.map(charge => {
      const status = chargeStatus(charge);
      const config = status === "PAID" ? { label: "Pago", icon: CheckCircle2 }
        : status === "OVERDUE" ? { label: "Atrasado", icon: AlertCircle }
        : status === "CANCELED" ? { label: "Cancelado", icon: Ban }
        : { label: "A vencer", icon: Clock3 };
      const Icon = config.icon;
      return <article className="finance-charge" key={charge.id}>
        <div className="finance-charge-main">
          <div><strong>{charge.title}</strong>
            {charge.studentName && <span>Aluno: {charge.studentName}</span>}
            <span>Vencimento: {formatDueDate(charge.dueAt)}</span>
            <small>Pagante: {charge.payerLabel}</small>
            {charge.status === "PAID" && charge.paidAt && <small>Registrado como pago em {formatDueDate(charge.paidAt)}</small>}
          </div>
          <div className="finance-charge-right"><strong>{formatMoney(charge.amountCents)}</strong>
            <span className={`finance-status finance-status-${status.toLowerCase()}`}><Icon size={14}/>{config.label}</span>
          </div>
        </div>
      </article>;
    })}
  </div>;
}

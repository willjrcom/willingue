/** Values are always integer cents and are never treated as confirmation from a bank. */
export type ChargeState = "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
export function chargeStatus(charge: { status: string; dueAt: Date }, now = new Date()): ChargeState {
  if (charge.status === "PAID") return "PAID";
  if (charge.status === "CANCELED") return "CANCELED";
  const dueDay = Date.UTC(charge.dueAt.getUTCFullYear(), charge.dueAt.getUTCMonth(), charge.dueAt.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return dueDay < today ? "OVERDUE" : "PENDING";
}
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
export function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}
export function sumCharges(charges: Array<{ amountCents: number }>): number {
  return charges.reduce((sum, charge) => sum + charge.amountCents, 0);
}
export function parseAmountCents(raw: string): number | null {
  if (!/^[1-9][0-9]{0,6}(?:[,.][0-9]{1,2})?$/.test(raw)) return null;
  const [whole, fractional = ""] = raw.replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fractional.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

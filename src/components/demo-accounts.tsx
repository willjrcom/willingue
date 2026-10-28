"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Role = "STUDENT" | "ADMIN" | "GUARDIAN";
type Account = { role: Role; label: string; email: string; password: string };

const buttons = [
  { role: "STUDENT" as const, text: "Gerar usuário", icon: GraduationCap },
  { role: "ADMIN" as const, text: "Gerar admin", icon: ShieldCheck },
  { role: "GUARDIAN" as const, text: "Gerar responsável", icon: Users },
];

export function DemoAccounts() {
  const router = useRouter();
  const [creating, setCreating] = useState<Role | null>(null);
  const [entering, setEntering] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(role: Role) {
    if (creating || entering) return;
    setCreating(role);
    setAccount(null);
    setError("");
    setCopied(false);
    try {
      const response = await fetch("/api/demo/accounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }), cache: "no-store",
      });
      const data = await readApiJson<Account & { error?: string }>(response);
      if (!response.ok) throw new Error(data.error ?? "Falha ao gerar usuário.");
      setAccount(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar o usuário.");
    } finally { setCreating(null); }
  }

  async function enter() {
    if (!account || entering) return;
    setEntering(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: account.email, password: account.password }),
      });
      const data = await readApiJson<{ error?: string; redirect?: string }>(response);
      if (!response.ok) throw new Error(data.error ?? "Não foi possível entrar.");
      if (!data.redirect) throw new Error("O servidor não informou o destino do perfil.");
      router.replace(data.redirect);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
      setEntering(false);
    }
  }

  async function copyCredentials() {
    if (!account) return;
    try {
      await navigator.clipboard.writeText("E-mail: " + account.email + "\nSenha: " + account.password);
      setCopied(true);
    } catch { setError("Não foi possível copiar. Selecione os dados exibidos abaixo."); }
  }

  return <section className="demo-accounts" aria-labelledby="demo-accounts-title">
    <div className="demo-accounts-heading"><span className="demo-accounts-kicker">AMBIENTE DE DEMONSTRAÇÃO</span>
      <h3 id="demo-accounts-title">Gerar acesso de teste</h3>
      <p>Crie um perfil para explorar o Willingue. Os acessos são fictícios.</p>
    </div>
    <div className="demo-accounts-buttons">
      {buttons.map(({ role, text, icon: Icon }) => <button type="button" key={role}
        disabled={creating !== null || entering} onClick={() => generate(role)}
        className={"demo-account-button" + (account?.role === role ? " active" : "")}>
        <Icon size={19} aria-hidden="true"/>
        <span>{creating === role ? "Gerando..." : text}</span>
      </button>)}
    </div>
    {account && <div className="demo-account-result" aria-live="polite">
      <p className="demo-account-created"><Check size={17}/> Acesso de {account.label.toLowerCase()} gerado!</p>
      <div className="demo-account-credentials"><span>E-mail <strong>{account.email}</strong></span>
        <span>Senha <strong>{account.password}</strong></span></div>
      <div className="demo-account-result-actions">
        <button type="button" className="demo-account-copy" onClick={copyCredentials}><Copy size={16}/>{copied ? "Copiado!" : "Copiar acesso"}</button>
        <button type="button" className="demo-account-enter" onClick={enter} disabled={entering}>{entering ? "Entrando..." : "Entrar neste perfil"}<ArrowRight size={17}/></button>
      </div>
    </div>}
    {error && <p className="error-message" role="alert">{error}</p>}
    <p className="demo-accounts-warning">Disponível apenas com DEMO_SEED=true. Desative antes de utilizar dados reais.</p>
  </section>;
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Link2, Plus, UserPlus, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Guardian = { id: string; name: string; email: string;
  links: Array<{ studentId: string; name: string; financialResponsible: boolean }> };
type Student = { id: string; name: string };

export function GuardianManager({ guardians, students }: { guardians: Guardian[]; students: Student[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [payer, setPayer] = useState(false);
  const [remove, setRemove] = useState<{ guardianId: string; studentId: string; title: string } | null>(null);

  async function request(url: string, method: "POST" | "DELETE", body: object, success: string) {
    if (busy) return false;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const result = await readApiJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      setNotice(success); router.refresh();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao salvar.");
      return false;
    } finally { setBusy(false); }
  }
  async function createGuardian(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await request("/api/admin/guardians", "POST", { name, email, password }, "Responsável cadastrado.")) {
      setName(""); setEmail(""); setPassword("");
    }
  }
  async function linkStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await request("/api/admin/guardians/links", "POST",
      { guardianId, studentId, financialResponsible: payer }, "Vínculo atualizado.")) {
      setStudentId(""); setPayer(false);
    }
  }
  async function removeLink() {
    if (!remove) return;
    if (await request("/api/admin/guardians/links", "DELETE",
      { guardianId: remove.guardianId, studentId: remove.studentId }, "Vínculo removido.")) setRemove(null);
  }
  return <div className="admin-management">
    {notice && <p role="status" className="admin-feedback"><CheckCircle2 size={17}/> {notice}</p>}
    {error && <p role="alert" className="admin-feedback error">{error}</p>}
    <div className="admin-class-grid">
      <form onSubmit={createGuardian} className="admin-form-card">
        <h2><UserPlus size={21}/> Cadastrar responsável</h2>
        <p>O acesso poderá acompanhar mais de um aluno.</p>
        <label className="admin-field">Nome completo
          <input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)}
            placeholder="Nome do responsável"/></label>
        <label className="admin-field">E-mail
          <input required type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)}
            placeholder="responsavel@exemplo.com"/></label>
        <label className="admin-field">Senha inicial
          <input required type="password" autoComplete="new-password" minLength={8} maxLength={120}
            value={password} onChange={e => setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres"/></label>
        <button className="primary-button" disabled={busy}><Plus size={18}/> Salvar responsável</button>
      </form>
      <form onSubmit={linkStudent} className="admin-form-card">
        <h2><Link2 size={21}/> Vincular aluno</h2>
        <p>Um aluno pode possuir mais de um responsável.</p>
        <label className="admin-field">Responsável
          <select required value={guardianId} onChange={e => setGuardianId(e.target.value)}>
            <option value="">Selecione</option>
            {guardians.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select></label>
        <label className="admin-field">Aluno
          <select required value={studentId} onChange={e => setStudentId(e.target.value)}>
            <option value="">Selecione</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></label>
        <label className="admin-checkbox-row">
          <input type="checkbox" checked={payer} onChange={e => setPayer(e.target.checked)}/>
          <span>Pode ser responsável financeiro deste aluno</span>
        </label>
        <button className="primary-button" disabled={busy || !guardianId || !studentId}>
          <Link2 size={18}/> Salvar vínculo
        </button>
      </form>
    </div>
    <section className="section-block">
      <div className="section-heading"><h2>Responsáveis cadastrados</h2>
        <span className="heading-counter">{guardians.length}</span></div>
      <div className="admin-class-grid">
        {guardians.map(g => <article className="admin-class-card" key={g.id}>
          <header><div><h3>{g.name}</h3><p>{g.email}</p></div>
            <span className="admin-class-count">{g.links.length} aluno(s)</span></header>
          <div className="admin-class-member-list">{g.links.length ? g.links.map(l =>
            <div className="admin-class-member" key={l.studentId}>
              <span className="admin-class-member-icon">🎓</span>
              <span><strong>{l.name}</strong><small>{l.financialResponsible ? "Responsável financeiro" : "Acompanhamento"}</small></span>
              <button type="button" className="admin-minor danger" aria-label={`Remover vínculo de ${l.name}`}
                onClick={() => setRemove({ guardianId: g.id, studentId: l.studentId,
                  title: `${g.name} e ${l.name}` })}><X size={17}/></button>
            </div>) : <p className="muted-note">Nenhum aluno vinculado.</p>}</div>
        </article>)}
        {guardians.length === 0 && <div className="empty-card">Nenhum responsável cadastrado ainda.</div>}
      </div>
    </section>
    {remove && <div className="admin-dialog-backdrop">
      <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="remove-guardian-link">
        <h2 id="remove-guardian-link">Remover vínculo?</h2>
        <p>{remove.title} deixarão de compartilhar o acompanhamento escolar. Cobranças existentes não serão excluídas.</p>
        <div className="admin-dialog-actions">
          <button disabled={busy} type="button" onClick={() => setRemove(null)}>Cancelar</button>
          <button disabled={busy} className="admin-minor danger" type="button" onClick={removeLink}>
            {busy ? "Aguarde..." : "Remover vínculo"}
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

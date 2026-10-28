"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Guardian = { id: string; name: string; email: string;
  links: Array<{ studentId: string; name: string; financialResponsible: boolean }> };

export function GuardianManager({ guardians }: { guardians: Guardian[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
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
  async function removeLink() {
    if (!remove) return;
    if (await request("/api/admin/guardians/links", "DELETE",
      { guardianId: remove.guardianId, studentId: remove.studentId }, "Vínculo removido.")) setRemove(null);
  }
  return <div className="admin-management">
    {notice && <p role="status" className="admin-feedback"><CheckCircle2 size={17}/> {notice}</p>}
    {error && <p role="alert" className="admin-feedback error">{error}</p>}
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

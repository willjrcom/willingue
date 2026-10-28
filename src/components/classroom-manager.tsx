"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Student = { id: string; name: string; nickname: string; email: string; avatar: string };
type Classroom = { id: string; name: string; description: string; active: boolean; members: Student[] };
type RemoveTarget = { type: "classroom"; id: string; label: string }
  | { type: "member"; id: string; studentId: string; label: string };

export function ClassroomManager({ classrooms, students }: {
  classrooms: Classroom[];
  students: Student[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);

  async function perform(
    label: string, url: string, method: "POST" | "PATCH" | "DELETE",
    payload: Record<string, unknown>, success: string,
  ) {
    if (busy) return false;
    setBusy(label); setFeedback(null);
    try {
      const response = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await readApiJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir a operação.");
      setFeedback({ message: success, error: false });
      router.refresh();
      return true;
    } catch (cause) {
      setFeedback({ message: cause instanceof Error ? cause.message : "Erro ao salvar.", error: true });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function addMember(classroomId: string) {
    const studentId = selectedStudents[classroomId];
    if (!studentId) return;
    const ok = await perform("member-" + classroomId,
      `/api/admin/classrooms/${encodeURIComponent(classroomId)}/members`,
      "POST", { studentId }, "Aluno vinculado à turma.");
    if (ok) setSelectedStudents(prev => ({ ...prev, [classroomId]: "" }));
  }

  function beginEdit(item: Classroom) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
  }

  async function saveEdit(item: Classroom, active = item.active) {
    const ok = await perform("edit-" + item.id,
      `/api/admin/classrooms/${encodeURIComponent(item.id)}`,
      "PATCH", { name: editingId === item.id ? editName : item.name,
        description: editingId === item.id ? editDescription : item.description,
        active }, "Turma atualizada.");
    if (ok) setEditingId(null);
  }

  async function confirmRemoval() {
    if (!removeTarget) return;
    const item = removeTarget;
    const endpoint = `/api/admin/classrooms/${encodeURIComponent(item.id)}`;
    const ok = item.type === "classroom"
      ? await perform("delete-" + item.id, endpoint, "DELETE", {}, "Turma excluída.")
      : await perform("remove-" + item.studentId,
        endpoint + "/members", "DELETE", { studentId: item.studentId },
        "Aluno removido da turma.");
    if (ok) setRemoveTarget(null);
  }

  return <div className="admin-management">
    {feedback && <p className={`admin-feedback${feedback.error ? " error" : ""}`} role="status">{feedback.message}</p>}
    <section className="section-block">
      <div className="section-heading"><div><p className="eyebrow muted">ALUNOS E PARTICIPANTES</p>
        <h2>Turmas cadastradas</h2></div>
        <span className="heading-counter">{classrooms.length} {classrooms.length === 1 ? "turma" : "turmas"}</span>
      </div>
      {classrooms.length === 0 && <div className="empty-card"><span>👥</span>
        <h3>Nenhuma turma cadastrada</h3><p>Clique em "Nova turma" para cadastrar uma turma.</p></div>}
      <div className="admin-class-grid">
        {classrooms.map(item => {
          const available = students.filter(s => !item.members.some(m => m.id === s.id));
          return <article className="admin-class-card" key={item.id}>
            <header><div><h3>{item.name}</h3><p>{item.description || "Sem descrição"}</p>
              {!item.active && <small>Turma desativada — não aparece para os alunos.</small>}
            </div><span className="admin-class-count">{item.members.length} {item.members.length === 1 ? "aluno" : "alunos"}</span></header>
            <div className="admin-class-member-list">
              {item.members.length === 0 && <p className="muted-note">Nenhum aluno vinculado.</p>}
              {item.members.map(student => <div key={student.id} className="admin-class-member">
                <span className="admin-class-member-icon" aria-hidden="true">{student.avatar}</span>
                <span><strong>{student.nickname}</strong><small>{student.email}</small></span>
                <button type="button" className="admin-minor danger"
                  aria-label={`Remover ${student.nickname} da turma`}
                  onClick={() => setRemoveTarget({ type: "member", id: item.id, studentId: student.id, label: student.nickname })}>
                  <X size={17}/>
                </button>
              </div>)}
            </div>
            {available.length > 0 && <div className="admin-add-row">
              <label className="admin-field">Adicionar aluno existente
                <select value={selectedStudents[item.id] || ""}
                  onChange={e => setSelectedStudents(prev => ({ ...prev, [item.id]: e.target.value }))}>
                  <option value="">Selecione o aluno</option>
                  {available.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                </select>
              </label>
              <button type="button" className="admin-minor" disabled={!selectedStudents[item.id] || busy !== null}
                onClick={() => addMember(item.id)}><Plus size={19}/> Adicionar</button>
            </div>}
            {editingId === item.id && <div className="admin-class-edit">
              <label className="admin-field">Nome<input value={editName} maxLength={80} minLength={2}
                onChange={e => setEditName(e.target.value)}/></label>
              <label className="admin-field">Descrição<textarea value={editDescription} maxLength={240}
                onChange={e => setEditDescription(e.target.value)}/></label>
              <div className="admin-class-actions">
                <button type="button" className="admin-minor" onClick={() => saveEdit(item)} disabled={busy !== null}><Check size={17}/> Salvar</button>
                <button type="button" className="admin-minor" onClick={() => setEditingId(null)}><X size={17}/> Cancelar</button>
              </div>
            </div>}
            <div className="admin-class-actions">
              <button type="button" className="admin-minor"
                onClick={() => editingId === item.id ? setEditingId(null) : beginEdit(item)}>
                <Pencil size={16}/> {editingId === item.id ? "Fechar edição" : "Editar"}
              </button>
              <button type="button" className="admin-minor" onClick={() => saveEdit(item, !item.active)} disabled={busy !== null}>
                {item.active ? "Desativar" : "Ativar"}
              </button>
              <button type="button" className="admin-minor danger"
                onClick={() => setRemoveTarget({ type: "classroom", id: item.id, label: item.name })}>
                <Trash2 size={16}/> Excluir
              </button>
            </div>
          </article>;
        })}
      </div>
    </section>

    {removeTarget && <div className="admin-dialog-backdrop">
      <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="class-delete-title">
        <h2 id="class-delete-title">{removeTarget.type === "classroom" ? "Excluir turma?" : "Remover aluno?"}</h2>
        <p>{removeTarget.type === "classroom"
          ? `A turma "${removeTarget.label}" será excluída e seus vínculos removidos. As lições e o progresso dos alunos serão preservados.`
          : `Remover "${removeTarget.label}" desta turma? As lições concluídas não serão apagadas.`}</p>
        <div className="admin-dialog-actions">
          <button type="button" onClick={() => setRemoveTarget(null)} disabled={busy !== null}>Cancelar</button>
          <button type="button" className="admin-minor danger" onClick={confirmRemoval} disabled={busy !== null}>
            {busy ? "Aguarde..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

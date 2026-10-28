"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, UserRound } from "lucide-react";

type Student = {
  id: string; name: string; nickname: string; email: string; avatar: string;
  ageMode: string; xp: number; completed: number; classes: string[]; guardians: string[];
};
export function AdminStudentList({ students }: { students: Student[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => students.filter(s => {
    const phrase = (s.name+" "+s.nickname+" "+s.email+" "+s.classes.join(" ")).toLocaleLowerCase("pt-BR");
    return phrase.includes(search.toLocaleLowerCase("pt-BR").trim())
      && (filter === "all" || (filter === "no-class" ? s.classes.length === 0
        : filter === "no-guardian" ? s.guardians.length === 0
          : filter === "no-lessons" ? s.completed === 0 : true));
  }),[students, search, filter]);
  return <section className="admin-panel admin-student-panel">
    <div className="admin-student-tools">
      <label className="admin-searchbox"><Search size={19}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou turma..." aria-label="Buscar alunos"/></label>
      <select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filtrar alunos">
        <option value="all">Todos os alunos</option>
        <option value="no-class">Sem turma</option>
        <option value="no-guardian">Sem responsável</option>
        <option value="no-lessons">Sem lições concluídas</option>
      </select>
    </div>
    <p className="admin-table-caption">{filtered.length} {filtered.length === 1 ? "aluno encontrado" : "alunos encontrados"}</p>
    <div className="admin-students">
      {filtered.map(s => <Link href={`/admin/students/${s.id}`} key={s.id} className="admin-student-row">
        <span className="admin-student-avatar">{s.avatar}</span>
        <span className="admin-student-name"><strong>{s.name}</strong><small>{s.email}</small></span>
        <span className="admin-student-class"><span>{s.classes.join(", ") || "Sem turma"}</span>
          <small>{s.guardians.length ? `${s.guardians.length} responsável(is)` : "Sem responsável"}</small></span>
        <span className="admin-student-progress"><BookOpen size={16}/><strong>{s.completed}</strong><small>lições</small></span>
        <ArrowRight size={18} className="admin-student-chevron"/>
      </Link>)}
      {!filtered.length && <div className="admin-inline-empty"><UserRound size={26}/><p>Nenhum aluno encontrado para esses filtros.</p></div>}
    </div>
  </section>;
}

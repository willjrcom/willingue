"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Save, ShieldCheck } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Path = { id: string; title: string; depth: number };
export function AdminStudentEditor({ id, name, nickname, birthDate, paths, assigned }: {
  id: string; name: string; nickname: string; birthDate: string; paths: Path[]; assigned: string[];
}) {
  const router=useRouter();
  const [draftName,setName]=useState(name);
  const [draftNickname,setNickname]=useState(nickname);
  const [birthday,setBirthday]=useState(birthDate);
  const [assignedIds,setAssignedIds]=useState(assigned);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setError("");setSuccess("");
    try{
      const response=await fetch(`/api/admin/students/${id}`,{
        method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:draftName,nickname:draftNickname,birthDate:birthday || null,assignedPathIds:assignedIds}),
      });
      const result=await readApiJson<{error?:string}>(response);
      if(!response.ok)throw new Error(result.error||"Não foi possível atualizar.");
      setSuccess("Cadastro e atribuições atualizados.");router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Falha ao salvar");}
    finally{setBusy(false);}
  }
  return <form className="admin-panel admin-student-editor" onSubmit={save}>
    <div className="admin-panel-heading"><div><p className="admin-eyebrow">CADASTRO E ACESSO</p><h2>Dados e trilhas liberadas</h2></div></div>
    <div className="admin-fields">
      <label className="admin-field">Nome completo<input required minLength={2} maxLength={100} value={draftName} onChange={e=>setName(e.target.value)}/></label>
      <label className="admin-field">Apelido<input maxLength={32} value={draftNickname} onChange={e=>setNickname(e.target.value)}/></label>
      <label className="admin-field">Data de nascimento<input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} max={new Date().toISOString().slice(0,10)}/></label>
    </div>
    <div><h3>Trilhas atribuídas individualmente</h3><p className="admin-muted-note">Trilhas públicas já estão liberadas a todos; a atribuição permite acessar trilhas restritas.</p>
      <div className="admin-assign-grid">{paths.map(path=><label key={path.id}>
        <input type="checkbox" checked={assignedIds.includes(path.id)}
          onChange={e=>setAssignedIds(old=>e.target.checked?[...old,path.id]:old.filter(x=>x!==path.id))}/>
        <span>{path.depth?"↳ ":""}{path.title}</span>
      </label>)}</div>
    </div>
    {error&&<p className="admin-feedback error" role="alert">{error}</p>}
    {success&&<p className="admin-feedback" role="status"><Check size={16}/>{success}</p>}
    <button className="admin-action-primary" type="submit" disabled={busy}><Save size={17}/>{busy?"Salvando...":"Salvar alterações"}</button>
  </form>;
}

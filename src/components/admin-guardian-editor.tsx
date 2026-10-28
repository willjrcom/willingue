"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";
export function AdminGuardianEditor({id,name,email}:{id:string;name:string;email:string}){
 const router=useRouter();const [open,setOpen]=useState(false);
 const [newName,setNewName]=useState(name);const [newEmail,setNewEmail]=useState(email);
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 function close(){if(busy)return;setOpen(false);setError("");}
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const r=await fetch(`/api/admin/guardians/${id}`,{method:"PATCH",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newName,email:newEmail})});
   const data=await readApiJson<{error?:string}>(r);
   if(!r.ok)throw Error(data.error||"Não foi possível editar.");
   setOpen(false);router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Falha ao salvar.");}finally{setBusy(false);}
 }
 return <>
  <button type="button" className="admin-secondary-button" onClick={()=>{setNewName(name);setNewEmail(email);setError("");setOpen(true);}}>
   <Pencil size={17}/> Editar responsável</button>
  {open&&<div className="admin-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
   <form className="admin-dialog admin-modal-large" role="dialog" aria-modal="true" aria-labelledby="edit-guardian-title" onSubmit={save}>
    <div className="admin-panel-heading"><h2 id="edit-guardian-title">Editar responsável</h2>
     <button type="button" disabled={busy} className="admin-icon-button" aria-label="Fechar" onClick={close}><X size={20}/></button></div>
    <label className="admin-field">Nome completo<input autoFocus required minLength={2} maxLength={100} value={newName} onChange={e=>setNewName(e.target.value)}/></label>
    <label className="admin-field">E-mail de acesso<input required type="email" maxLength={254} value={newEmail} onChange={e=>setNewEmail(e.target.value)}/></label>
    <p className="admin-muted-note">Os vínculos com alunos e as cobranças não serão alterados.</p>
    {error&&<p role="alert" className="admin-feedback error">{error}</p>}
    <div className="admin-dialog-actions"><button type="button" disabled={busy} onClick={close}>Cancelar</button>
     <button className="admin-action-primary" disabled={busy}><Save size={16}/>{busy?"Salvando...":"Salvar"}</button></div>
   </form>
  </div>}
 </>;
}

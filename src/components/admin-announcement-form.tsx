"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Save } from "lucide-react";
import { readApiJson } from "@/lib/api-client";
export function AdminAnnouncementForm({classrooms}:{classrooms:Array<{id:string;name:string}>}){
 const router=useRouter();
 const [title,setTitle]=useState("");const [message,setMessage]=useState("");
 const [audience,setAudience]=useState("ALL");const [classroomId,setClassroomId]=useState("");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const r=await fetch("/api/admin/announcements",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({title,message,audience,classroomId:audience==="CLASSROOM"?classroomId:null})});
   const data=await readApiJson<{error?:string}>(r);
   if(!r.ok)throw Error(data.error||"Falha ao salvar.");
   router.push("/administrador/comunicados");router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Não foi possível salvar.");setBusy(false);}
 }
 return <form className="admin-create-form" onSubmit={submit}>
  <div className="admin-create-section"><span><Megaphone size={22}/></span><div><h2>Mensagem e público</h2>
   <p>Primeiro salvamos como rascunho. Você confirma o envio na listagem.</p></div></div>
  <div className="admin-fields">
   <label className="admin-field full">Título<input required minLength={3} maxLength={110}
    value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Atividades desta semana"/></label>
   <label className="admin-field">Destinatários<select value={audience} onChange={e=>setAudience(e.target.value)}>
    <option value="ALL">Alunos e responsáveis</option><option value="STUDENTS">Todos os alunos</option>
    <option value="GUARDIANS">Todos os responsáveis</option><option value="CLASSROOM">Alunos de uma turma</option>
   </select></label>
   {audience==="CLASSROOM"&&<label className="admin-field">Turma<select required value={classroomId} onChange={e=>setClassroomId(e.target.value)}>
    <option value="">Selecione a turma</option>{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
   </select></label>}
   <label className="admin-field full">Mensagem<textarea required minLength={5} maxLength={1800} rows={8}
    value={message} onChange={e=>setMessage(e.target.value)}
    placeholder="Escreva a informação que os destinatários receberão."/>
    <small>{message.length}/1800 caracteres</small></label>
  </div>
  <p className="admin-muted-note">Os destinatários recebem uma notificação no aplicativo. Não são enviados e-mails, mensagens de WhatsApp ou SMS.</p>
  {error&&<p role="alert" className="admin-feedback error">{error}</p>}
  <div className="admin-form-actions"><Link className="admin-secondary-button" href="/administrador/comunicados">Cancelar</Link>
   <button disabled={busy} className="admin-action-primary"><Save size={17}/>{busy?"Salvando...":"Salvar rascunho"}</button></div>
 </form>;
}

"use client";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, FilePenLine, Pencil, Search, Send, UsersRound, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";
type Notice={id:string;title:string;message:string;audience:string;classroomId:string|null;
 author:string;createdAt:string;sentAt:string|null;recipientCount:number};
type Classroom={id:string;name:string};
const labels:Record<string,string>={ALL:"Alunos e responsáveis",STUDENTS:"Alunos",GUARDIANS:"Responsáveis",CLASSROOM:"Turma"};
const date=(iso:string)=>new Date(iso).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"});
export function AdminAnnouncements({notices,classrooms}:{notices:Notice[];classrooms:Classroom[]}){
 const router=useRouter();
 const [search,setSearch]=useState("");const [filter,setFilter]=useState("all");
 const [editing,setEditing]=useState<Notice|null>(null);const [sending,setSending]=useState<Notice|null>(null);
 const [draft,setDraft]=useState({title:"",message:"",audience:"ALL",classroomId:""});
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const list=useMemo(()=>notices.filter(n=>(filter==="all"||(filter==="sent"?!!n.sentAt:!n.sentAt))&&
  (n.title+" "+n.message+" "+n.author).toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))),
  [notices,filter,search]);
 function openEdit(n:Notice){setEditing(n);setError("");setNotice("");
  setDraft({title:n.title,message:n.message,audience:n.audience,classroomId:n.classroomId||""});}
 async function saveEdit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!editing||busy)return;setBusy(true);setError("");
  try{
   const r=await fetch(`/api/admin/announcements/${editing.id}`,{method:"PATCH",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({...draft,classroomId:draft.audience==="CLASSROOM"?draft.classroomId:null})});
   const d=await readApiJson<{error?:string}>(r);if(!r.ok)throw Error(d.error||"Falha ao editar.");
   setEditing(null);setNotice("Comunicado atualizado.");router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Não foi possível salvar.");}finally{setBusy(false);}
 }
 async function send(){
  if(!sending||busy)return;setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch(`/api/admin/announcements/${sending.id}/send`,{method:"POST"});
   const d=await readApiJson<{error?:string;recipients?:number}>(r);if(!r.ok)throw Error(d.error||"Falha ao enviar.");
   setSending(null);setNotice(`Comunicado enviado para ${d.recipients||0} destinatários.`);router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Falha ao enviar.");}finally{setBusy(false);}
 }
 return <section className="admin-panel">
  <div className="admin-student-tools"><label className="admin-searchbox"><Search size={18}/>
   <input aria-label="Pesquisar comunicados" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar comunicados..."/></label>
   <select aria-label="Filtrar por situação" value={filter} onChange={e=>setFilter(e.target.value)}>
    <option value="all">Todos</option><option value="draft">Rascunhos</option><option value="sent">Enviados</option>
   </select></div>
  {notice&&<p role="status" className="admin-feedback"><Check size={17}/>{notice}</p>}
  {error&&!editing&&!sending&&<p role="alert" className="admin-feedback error">{error}</p>}
  <div className="admin-comm-list">
   {list.map(n=><article className="admin-comm-item" key={n.id}>
    <div className="admin-comm-icon"><FilePenLine size={23}/></div>
    <div className="admin-comm-body">
     <div className="admin-comm-name"><strong>{n.title}</strong><span className={`admin-state-tag ${n.sentAt?"on":"off"}`}>{n.sentAt?"Enviado":"Rascunho"}</span></div>
     <p>{n.message}</p>
     <div className="admin-comm-metadata"><span><UsersRound size={14}/>{labels[n.audience]||"Personalizado"}{n.classroomId?" · "+(classrooms.find(c=>c.id===n.classroomId)?.name||"Turma"):""}</span>
      <span>{date(n.createdAt)}</span><span>{n.sentAt?`${n.recipientCount} destinatários`:`Criado por ${n.author}`}</span></div>
    </div>
    {!n.sentAt&&<div className="admin-comm-actions">
     <button type="button" className="admin-secondary-button" onClick={()=>openEdit(n)}><Pencil size={15}/> Editar</button>
     <button type="button" className="admin-action-primary" onClick={()=>{setError("");setSending(n);}}><Send size={15}/> Enviar</button>
    </div>}
   </article>)}
   {!list.length&&<div className="admin-inline-empty">Nenhum comunicado encontrado. Crie um aviso para começar.</div>}
  </div>
  {editing&&<div className="admin-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setEditing(null);}}>
   <form className="admin-dialog admin-modal-large" onSubmit={saveEdit} role="dialog" aria-modal="true" aria-labelledby="edit-comm-title">
    <div className="admin-panel-heading"><h2 id="edit-comm-title">Editar comunicado</h2>
     <button type="button" className="admin-icon-button" aria-label="Fechar" disabled={busy} onClick={()=>setEditing(null)}><X size={19}/></button></div>
    <label className="admin-field">Título<input value={draft.title} minLength={3} maxLength={110} required onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
    <label className="admin-field">Público<select value={draft.audience} onChange={e=>setDraft({...draft,audience:e.target.value})}>
     <option value="ALL">Alunos e responsáveis</option><option value="STUDENTS">Alunos</option>
     <option value="GUARDIANS">Responsáveis</option><option value="CLASSROOM">Turma</option></select></label>
    {draft.audience==="CLASSROOM"&&<label className="admin-field">Turma<select value={draft.classroomId} required onChange={e=>setDraft({...draft,classroomId:e.target.value})}>
     <option value="">Selecione</option>{classrooms.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}
    </select></label>}
    <label className="admin-field">Mensagem<textarea rows={5} minLength={5} maxLength={1800} required value={draft.message}
     onChange={e=>setDraft({...draft,message:e.target.value})}/></label>
    {error&&<p role="alert" className="admin-feedback error">{error}</p>}
    <div className="admin-dialog-actions"><button type="button" disabled={busy} onClick={()=>setEditing(null)}>Cancelar</button>
     <button className="admin-action-primary" disabled={busy}>{busy?"Salvando...":"Salvar alterações"}</button></div>
   </form>
  </div>}
  {sending&&<div className="admin-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setSending(null);}}>
   <div role="dialog" aria-modal="true" aria-labelledby="send-comm-title" className="admin-dialog">
    <h2 id="send-comm-title">Enviar comunicado?</h2>
    <p>O aviso “{sending.title}” será enviado aos destinatários selecionados. Após o envio, não poderá ser editado nem reenviado.</p>
    {error&&<p role="alert" className="admin-feedback error">{error}</p>}
    <div className="admin-dialog-actions"><button type="button" disabled={busy} onClick={()=>setSending(null)}>Cancelar</button>
     <button type="button" className="admin-action-primary" disabled={busy} onClick={send}>{busy?"Enviando...":"Confirmar envio"}</button></div>
   </div>
  </div>}
 </section>;
}

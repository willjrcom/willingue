"use client";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Coins, Save, School, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { readApiJson } from "@/lib/api-client";
type Settings={schoolName:string;description:string;contactEmail:string;defaultLessonXp:number;defaultLessonCoins:number};
export function AdminSettingsForm({settings}:{settings:Settings}){
 const router=useRouter();const [value,setValue]=useState(settings);
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [saved,setSaved]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setBusy(true);setSaved(false);setError("");
  try{
   const response=await fetch("/api/admin/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)});
   const result=await readApiJson<{error?:string}>(response);
   if(!response.ok)throw Error(result.error||"Falha ao salvar.");
   setSaved(true);router.refresh();
  }catch(cause){setError(cause instanceof Error?cause.message:"Falha ao salvar as configurações.");}
  finally{setBusy(false);}
 }
 return <form className="admin-settings-column" onSubmit={submit}>
  <section className="admin-panel">
   <div className="admin-panel-heading"><div><p className="admin-eyebrow">IDENTIDADE</p>
    <h2>Dados da escola</h2></div><School size={22}/></div>
   <div className="admin-fields">
    <label className="admin-field full">Nome da escola
     <input required minLength={2} maxLength={110} value={value.schoolName} onChange={e=>setValue({...value,schoolName:e.target.value})}/></label>
    <label className="admin-field full">E-mail para contato
     <input type="email" maxLength={254} value={value.contactEmail} placeholder="contato@escola.com.br"
      onChange={e=>setValue({...value,contactEmail:e.target.value})}/></label>
    <label className="admin-field full">Apresentação da escola
     <textarea maxLength={300} value={value.description} rows={3}
      placeholder="Uma frase sobre sua escola..." onChange={e=>setValue({...value,description:e.target.value})}/></label>
   </div>
  </section>
  <section className="admin-panel">
   <div className="admin-panel-heading"><div><p className="admin-eyebrow">GAMIFICAÇÃO</p><h2>Regras padrão de pontuação</h2></div><SlidersHorizontal size={22}/></div>
   <div className="admin-fields">
    <label className="admin-field">XP padrão por lição
     <input type="number" min={0} max={10000} value={value.defaultLessonXp}
      onChange={e=>setValue({...value,defaultLessonXp:Number(e.target.value)})}/></label>
    <label className="admin-field">Moedas padrão por lição
     <input type="number" min={0} max={10000} value={value.defaultLessonCoins}
      onChange={e=>setValue({...value,defaultLessonCoins:Number(e.target.value)})}/></label>
   </div>
   <p className="admin-muted-note"><Coins size={15} style={{display:"inline",verticalAlign:"middle"}}/> Os valores são sugeridos ao criar novas lições. Lições existentes, moedas e XP já recebidos não mudam.</p>
  </section>
  {saved&&<p className="admin-feedback" role="status"><CheckCircle2 size={18}/> Configurações salvas com sucesso.</p>}
  {error&&<p className="admin-feedback error" role="alert">{error}</p>}
  <button type="submit" className="admin-action-primary admin-settings-save" disabled={busy}>
   <Save size={18}/>{busy?"Salvando...":"Salvar configurações"}</button>
 </form>;
}

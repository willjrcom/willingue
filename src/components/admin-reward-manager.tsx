"use client";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Coins, Gift, Pencil, Plus, Save, Search, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Reward = { id:string;name:string;description:string;icon:string;category:string;price:number;active:boolean;position:number;redemptions:number };
type Category = "AVATAR" | "STICKER" | "FRAME";
const categories: Array<{id: Category; label:string}> = [
  {id:"AVATAR",label:"Avatar"}, {id:"STICKER",label:"Figurinha"}, {id:"FRAME",label:"Moldura"}
];
const blank={name:"",description:"",icon:"🌟",category:"STICKER" as Category,price:"50",active:true,position:"0"};
export function AdminRewardManager({items}:{items:Reward[]}) {
  const router=useRouter();
  const [editing,setEditing]=useState<string|null>(null);
  const [form,setForm]=useState({...blank});
  const [showForm,setShowForm]=useState(false);
  const [filter,setFilter]=useState("ALL");
  const [search,setSearch]=useState("");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const filtered=useMemo(()=>items.filter(i=>
    (filter==="ALL" || (filter==="ACTIVE" ? i.active : !i.active)) &&
    (i.name+" "+i.description).toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))
  ),[items,search,filter]);
  function edit(item:Reward){
    setForm({name:item.name,description:item.description,icon:item.icon,
      category:item.category as Category,price:String(item.price),active:item.active,position:String(item.position)});
    setEditing(item.id);setShowForm(true);setError("");setNotice("");
    // The edit form opens as a modal, preserving the current catalog scroll position.
  }
  function create(){setForm({...blank});setEditing(null);setShowForm(true);setError("");setNotice("");}
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setError("");setNotice("");
    try {
      const result=await fetch(editing?`/api/admin/rewards/${editing}`:"/api/admin/rewards",{
        method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,price:Number(form.price),position:Number(form.position)}),
      });
      const body=await readApiJson<{error?:string}>(result);
      if(!result.ok)throw Error(body.error||"Erro ao salvar recompensa.");
      setShowForm(false);setEditing(null);setNotice("Recompensa salva na loja.");router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Erro ao salvar.");}
    finally{setBusy(false);}
  }
  return <div className="admin-management">
    <div className="admin-panel-heading"><h2>Catálogo de recompensas</h2>
      <button className="admin-action-primary" type="button" onClick={create}><Plus size={17}/> Nova recompensa</button></div>
    {notice&&<p className="admin-feedback" role="status">{notice}</p>}
    {error&&!showForm&&<p className="admin-feedback error" role="alert">{error}</p>}
    {showForm&&<div className={editing?"admin-dialog-backdrop":""}>
    <form role={editing?"dialog":undefined} aria-modal={editing?true:undefined} aria-label={editing?"Editar recompensa":undefined} className={editing?"admin-dialog admin-modal-large admin-editor-form":"admin-panel admin-editor-form"} onSubmit={submit}>
      <div className="admin-panel-heading"><h2>{editing?"Editar recompensa":"Nova recompensa"}</h2>
        <button type="button" aria-label="Fechar editor" className="admin-icon-button" onClick={()=>setShowForm(false)}><X size={20}/></button></div>
      <div className="admin-fields">
        <label className="admin-field">Nome<input required minLength={2} maxLength={90} value={form.name}
          onChange={e=>setForm(v=>({...v,name:e.target.value}))} placeholder="Ex.: Figurinha campeão"/></label>
        <label className="admin-field">Tipo de recompensa<select value={form.category}
          onChange={e=>setForm(v=>({...v,category:e.target.value as Category}))}>
          {categories.map(c=><option value={c.id} key={c.id}>{c.label}</option>)}</select></label>
        <label className="admin-field">Ícone (emoji)<input required maxLength={16} value={form.icon}
          onChange={e=>setForm(v=>({...v,icon:e.target.value}))} placeholder="🌟"/></label>
        <label className="admin-field">Preço em moedas<input required type="number" min={0} max={1000000}
          value={form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))}/></label>
        <label className="admin-field full">Descrição<textarea required minLength={3} maxLength={250}
          value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))}/></label>
        <label className="admin-field">Ordem de exibição<input type="number" min={0} max={10000}
          value={form.position} onChange={e=>setForm(v=>({...v,position:e.target.value}))}/></label>
        <label className="admin-checkbox-row"><input type="checkbox" checked={form.active}
          onChange={e=>setForm(v=>({...v,active:e.target.checked}))}/> Disponível para novos resgates</label>
      </div>
      <p className="admin-muted-note">Ao desativar, o item sai das novas compras. Os alunos que já resgataram mantêm o acesso.</p>
      {error&&<p className="admin-feedback error" role="alert">{error}</p>}
      <div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={()=>setShowForm(false)}>Cancelar</button>
        <button type="submit" className="admin-action-primary" disabled={busy}><Save size={17}/>{busy?"Salvando...":"Salvar recompensa"}</button></div>
    </form></div>}
    <section className="admin-panel">
      <div className="admin-student-tools">
        <label className="admin-searchbox"><Search size={18}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar recompensas..."/></label>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="ALL">Todas</option><option value="ACTIVE">Ativas</option><option value="INACTIVE">Inativas</option>
        </select>
      </div>
      <div className="admin-rewards-grid">
        {filtered.map(i=><article className="admin-reward-item" key={i.id}>
          <div className="admin-reward-preview"><span>{i.icon}</span><small>{categories.find(c=>c.id===i.category)?.label||i.category}</small></div>
          <div className="admin-reward-details"><div className="admin-reward-heading"><strong>{i.name}</strong>
            <span className={`admin-state-tag ${i.active?"on":"off"}`}>{i.active?"Ativa":"Inativa"}</span></div>
            <p>{i.description}</p>
            <div className="admin-reward-meta"><span><Coins size={16}/> {i.price} moedas</span>
              <span><Gift size={16}/> {i.redemptions} resgates</span></div></div>
          <button className="admin-icon-button" type="button" aria-label={`Editar ${i.name}`}
            onClick={()=>edit(i)}><Pencil size={18}/></button>
        </article>)}
        {!filtered.length&&<div className="admin-inline-empty">Nenhuma recompensa encontrada.</div>}
      </div>
    </section>
  </div>;
}

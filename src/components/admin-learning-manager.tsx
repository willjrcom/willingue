"use client";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, ChevronDown, ClipboardList, Layers3, Pencil, Plus, Save, Sparkles, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Trail = {id:string;title:string;description:string;icon:string;color:string;position:number;
  parentId:string|null;access:string;published:boolean;lessonCount:number;childCount:number};
type Quiz = {id:string;kind:string;prompt:string;position:number;options:string;answer:string;explanation:string};
type Lesson = {id:string;title:string;description:string;icon:string;pathId:string;position:number;
  xpReward:number;coinReward:number;published:boolean;completionCount:number;questions:Quiz[]};
type Kind="MULTIPLE_CHOICE"|"TRUE_FALSE"|"FILL_BLANK"|"TRANSLATION"|"ORDER_WORDS"|"MATCHING";
type Panel="paths"|"lessons"|"questions";
const kinds: Array<{value:Kind;label:string}>=[
  {value:"MULTIPLE_CHOICE",label:"Múltipla escolha"},
  {value:"TRUE_FALSE",label:"Verdadeiro ou falso"},
  {value:"FILL_BLANK",label:"Completar frase"},
  {value:"TRANSLATION",label:"Tradução"},
  {value:"ORDER_WORDS",label:"Ordenar palavras"},
  {value:"MATCHING",label:"Associação"},
];
const blankTrail={title:"",description:"",icon:"📚",color:"#7062eb",parentId:"",access:"PUBLIC",published:true,position:0};
const blankLesson={title:"",description:"",icon:"⭐",pathId:"",position:0,xpReward:30,coinReward:15,published:false};
const blankQuestion={kind:"MULTIPLE_CHOICE" as Kind,prompt:"",explanation:"",position:0,optionsText:"",answerText:""};
const split=(s:string)=>s.split("\n").map(v=>v.trim()).filter(Boolean);
function decode(question:Quiz) {
  const opts:unknown=JSON.parse(question.options);
  const answer:unknown=JSON.parse(question.answer);
  const answers=Array.isArray(answer)?answer.map(String):[String(answer)];
  let optionsText="";
  if(question.kind==="MATCHING"&&Array.isArray(opts)) {
    optionsText=opts.map((x,i)=>{
      if(!x||typeof x!=="object"||!("left" in x)||!("choices" in x))return "";
      const row=x as {left:string;choices:string[]};
      return row.left+" = "+[answers[i],...row.choices.filter(c=>c!==answers[i])].join(" | ");
    }).join("\n");
  }else if(Array.isArray(opts))optionsText=opts.map(String).join("\n");
  return {kind:question.kind as Kind,prompt:question.prompt,explanation:question.explanation||"",
    position:question.position,optionsText,answerText:answers.join("\n")};
}
function payloadQuestion(q:typeof blankQuestion,lessonId:string) {
  const answerLines=split(q.answerText);
  const optionsLines=split(q.optionsText);
  let options:string[]|Array<{left:string;choices:string[]}>=[];
  let answer:string|string[]=answerLines;
  if(q.kind==="MULTIPLE_CHOICE") { options=optionsLines;answer=answerLines[0]||""; }
  else if(q.kind==="TRUE_FALSE") { options=["Verdadeiro","Falso"];answer=answerLines[0]||"Verdadeiro"; }
  else if(q.kind==="ORDER_WORDS") {options=optionsLines;answer=answerLines;}
  else if(q.kind==="MATCHING"){
    const rows=optionsLines.map(line=>{
      const [left,...tail]=line.split("=");
      const variants=tail.join("=").split("|").map(s=>s.trim()).filter(Boolean);
      return {left:left.trim(),choices:variants};
    });
    options=rows;
    answer=rows.map(r=>r.choices[0]||"");
  }
  return {lessonId,kind:q.kind,prompt:q.prompt,explanation:q.explanation,position:q.position,options,answer};
}

export function AdminLearningManager({paths,lessons,defaultXp,defaultCoins}:{paths:Trail[];lessons:Lesson[];defaultXp:number;defaultCoins:number}) {
  const router=useRouter();
  const [tab,setTab]=useState<Panel>("paths");
  const [trailForm,setTrailForm]=useState({...blankTrail});
  const [trailEditing,setTrailEditing]=useState<string|null>(null);
  const [showTrail,setShowTrail]=useState(false);
  const [lessonForm,setLessonForm]=useState({...blankLesson,pathId:paths[0]?.id||"",xpReward:defaultXp,coinReward:defaultCoins});
  const [lessonEditing,setLessonEditing]=useState<string|null>(null);
  const [showLesson,setShowLesson]=useState(false);
  const [lessonId,setLessonId]=useState(lessons[0]?.id||"");
  const [questionForm,setQuestionForm]=useState({...blankQuestion});
  const [questionEditing,setQuestionEditing]=useState<string|null>(null);
  const [showQuestion,setShowQuestion]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const currentLesson=lessons.find(l=>l.id===lessonId);
  const sortedPaths=useMemo(()=>{
    const known=new Map(paths.map(p=>[p.id,p]));
    const depth=(id:string,visited=new Set<string>()):number=>{
      if(visited.has(id))return 0;
      const p=known.get(id);
      if(!p?.parentId)return 0;
      visited.add(id);
      return 1+depth(p.parentId,visited);
    };
    return paths.map(p=>({...p,depth:depth(p.id)}));
  },[paths]);
  async function save(url:string,method:"POST"|"PATCH",payload:object,done:string) {
    setBusy(true);setError("");setNotice("");
    try{
      const response=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await readApiJson<{error?:string}>(response);
      if(!response.ok)throw Error(data.error||"Não foi possível salvar.");
      setNotice(done);router.refresh();return true;
    }catch(e){setError(e instanceof Error?e.message:"Falha ao salvar");return false;}
    finally{setBusy(false);}
  }
  function addTrail(){setTrailEditing(null);setTrailForm({...blankTrail});setShowTrail(true);setError("");}
  function editTrail(p:Trail){setTrailEditing(p.id);setTrailForm({...p,parentId:p.parentId||""});setShowTrail(true);setError("");}
  async function submitTrail(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const ok=await save(trailEditing?`/api/admin/paths/${trailEditing}`:"/api/admin/paths",
      trailEditing?"PATCH":"POST",{...trailForm,parentId:trailForm.parentId||null},
      trailEditing?"Trilha atualizada.":"Nova trilha criada.");
    if(ok)setShowTrail(false);
  }
  function addLesson(){
    setLessonEditing(null);setLessonForm({...blankLesson,pathId:paths[0]?.id||"",xpReward:defaultXp,coinReward:defaultCoins});
    setShowLesson(true);setError("");
  }
  function editLesson(l:Lesson){
    setLessonEditing(l.id);
    setLessonForm({title:l.title,description:l.description,icon:l.icon,pathId:l.pathId,
      position:l.position,xpReward:l.xpReward,coinReward:l.coinReward,published:l.published});
    setShowLesson(true);setError("");
  }
  async function submitLesson(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const ok=await save(lessonEditing?`/api/admin/lessons/${lessonEditing}`:"/api/admin/lessons",
      lessonEditing?"PATCH":"POST",lessonForm,
      lessonEditing?"Lição atualizada.":"Lição criada como rascunho. Adicione questões antes de publicar.");
    if(ok)setShowLesson(false);
  }
  function addQuestion(){setQuestionEditing(null);setQuestionForm({...blankQuestion,position:(currentLesson?.questions.length||0)+1});
    setShowQuestion(true);setError("");}
  function editQuestion(q:Quiz){try{setQuestionEditing(q.id);setQuestionForm(decode(q));setShowQuestion(true);setError("");}
    catch{setError("Não foi possível ler o formato salvo dessa questão.");}}
  async function submitQuestion(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!lessonId)return;
    const ok=await save(questionEditing?`/api/admin/questions/${questionEditing}`:"/api/admin/questions",
      questionEditing?"PATCH":"POST",payloadQuestion(questionForm,lessonId),
      questionEditing?"Questão atualizada.":"Questão adicionada à lição.");
    if(ok)setShowQuestion(false);
  }
  return <div className="admin-management">
    <nav className="admin-learning-tabs" aria-label="Editor de aprendizado">
      <button type="button" className={tab==="paths"?"active":""} onClick={()=>{setTab("paths");setError("");}}>
        <Layers3 size={18}/> Trilhas</button>
      <button type="button" className={tab==="lessons"?"active":""} onClick={()=>{setTab("lessons");setError("");}}>
        <BookOpen size={18}/> Lições</button>
      <button type="button" className={tab==="questions"?"active":""} onClick={()=>{setTab("questions");setError("");}}>
        <ClipboardList size={18}/> Questões</button>
    </nav>
    {notice&&<p className="admin-feedback" role="status"><Check size={16}/>{notice}</p>}
    {error&&<p className="admin-feedback error" role="alert">{error}</p>}
    {tab==="paths"&&<section className="admin-learning-editor">
      <div className="admin-panel-heading"><div><h2>Trilhas de aprendizado</h2><p className="admin-learning-help">Organize caminhos e subtrilhas em quantos níveis precisar.</p></div>
        <button type="button" className="admin-action-primary" onClick={addTrail}><Plus size={16}/> Nova trilha</button></div>
      {showTrail&&<div className={trailEditing?"admin-dialog-backdrop":""}>
       <form role={trailEditing?"dialog":undefined} aria-modal={trailEditing?true:undefined} aria-label={trailEditing?"Editar trilha":undefined} className={trailEditing?"admin-dialog admin-modal-large admin-learning-modal":"admin-panel"} onSubmit={submitTrail}>
        <div className="admin-panel-heading"><h2>{trailEditing?"Editar trilha":"Criar trilha"}</h2>
          <button className="admin-icon-button" type="button" aria-label="Fechar" onClick={()=>setShowTrail(false)}><X size={20}/></button></div>
        <div className="admin-fields">
          <label className="admin-field">Nome<input required minLength={2} maxLength={100} value={trailForm.title}
            onChange={e=>setTrailForm(v=>({...v,title:e.target.value}))}/></label>
          <label className="admin-field">Trilha superior
            <select value={trailForm.parentId} onChange={e=>setTrailForm(v=>({...v,parentId:e.target.value}))}>
              <option value="">Trilha principal (sem superior)</option>
              {sortedPaths.filter(p=>p.id!==trailEditing).map(p=><option value={p.id} key={p.id}>
                {"— ".repeat(p.depth)}{p.title}</option>)}
            </select></label>
          <label className="admin-field full">Descrição<textarea maxLength={400} value={trailForm.description}
            onChange={e=>setTrailForm(v=>({...v,description:e.target.value}))}/></label>
          <label className="admin-field">Ícone (emoji)<input required maxLength={16} value={trailForm.icon}
            onChange={e=>setTrailForm(v=>({...v,icon:e.target.value}))}/></label>
          <label className="admin-field">Cor<input type="color" value={trailForm.color}
            onChange={e=>setTrailForm(v=>({...v,color:e.target.value}))}/></label>
          <label className="admin-field">Acesso<select value={trailForm.access}
            onChange={e=>setTrailForm(v=>({...v,access:e.target.value}))}>
            <option value="PUBLIC">Pública (todos)</option><option value="ASSIGNED">Atribuída (somente liberados)</option>
          </select></label>
          <label className="admin-field">Ordem<input type="number" min={0} max={10000} value={trailForm.position}
            onChange={e=>setTrailForm(v=>({...v,position:Number(e.target.value)}))}/></label>
          <label className="admin-checkbox-row"><input type="checkbox" checked={trailForm.published}
            onChange={e=>setTrailForm(v=>({...v,published:e.target.checked}))}/> Publicada e visível</label>
        </div>
        <div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={()=>setShowTrail(false)}>Cancelar</button>
          <button type="submit" className="admin-action-primary" disabled={busy}><Save size={16}/> Salvar trilha</button></div>
      </form></div>}
      <div className="admin-learning-card-grid">
        {sortedPaths.map(p=><article key={p.id} className="admin-learning-card">
          <div className="admin-learning-card-heading"><span className="admin-learning-card-emoji">{p.icon}</span>
            <span><strong>{p.depth?"↳ ".repeat(Math.min(p.depth,3)):""}{p.title}</strong>
              <small>{p.parentId?"Subtrilha":"Trilha principal"} · {p.lessonCount} lição(ões) · {p.childCount} subtrilha(s)</small></span></div>
          <p>{p.description||"Sem descrição"}</p>
          <div className="admin-learning-card-foot"><span className={`admin-learning-chip${!p.published?" draft":""}`}>
            {!p.published?"Rascunho":p.access==="PUBLIC"?"Pública":"Restrita"}</span>
            <button type="button" className="admin-minor" onClick={()=>editTrail(p)}><Pencil size={15}/> Editar</button></div>
        </article>)}
        {!paths.length&&<div className="admin-inline-empty">Nenhuma trilha cadastrada ainda.</div>}
      </div>
    </section>}
    {tab==="lessons"&&<section className="admin-learning-editor">
      <div className="admin-panel-heading"><div><h2>Lições</h2><p className="admin-learning-help">Defina recompensas de XP e moedas por conclusão.</p></div>
        <button className="admin-action-primary" type="button" disabled={!paths.length} onClick={addLesson}><Plus size={17}/> Nova lição</button></div>
      {showLesson&&<div className={lessonEditing?"admin-dialog-backdrop":""}>
      <form role={lessonEditing?"dialog":undefined} aria-modal={lessonEditing?true:undefined} aria-label={lessonEditing?"Editar lição":undefined} className={lessonEditing?"admin-dialog admin-modal-large admin-learning-modal":"admin-panel"} onSubmit={submitLesson}>
        <div className="admin-panel-heading"><h2>{lessonEditing?"Editar lição":"Nova lição"}</h2>
          <button className="admin-icon-button" aria-label="Fechar" type="button" onClick={()=>setShowLesson(false)}><X size={20}/></button></div>
        <div className="admin-fields">
          <label className="admin-field">Nome<input required minLength={2} maxLength={120} value={lessonForm.title}
            onChange={e=>setLessonForm(v=>({...v,title:e.target.value}))}/></label>
          <label className="admin-field">Trilha<select required value={lessonForm.pathId}
            onChange={e=>setLessonForm(v=>({...v,pathId:e.target.value}))}>
            {sortedPaths.map(p=><option value={p.id} key={p.id}>{"— ".repeat(p.depth)}{p.title}</option>)}</select></label>
          <label className="admin-field full">Descrição<textarea maxLength={300} value={lessonForm.description}
            onChange={e=>setLessonForm(v=>({...v,description:e.target.value}))}/></label>
          <label className="admin-field">Ícone<input required maxLength={16} value={lessonForm.icon}
            onChange={e=>setLessonForm(v=>({...v,icon:e.target.value}))}/></label>
          <label className="admin-field">Ordem<input type="number" min={0} max={10000} value={lessonForm.position}
            onChange={e=>setLessonForm(v=>({...v,position:Number(e.target.value)}))}/></label>
          <label className="admin-field">XP por conclusão<input type="number" min={0} max={10000} value={lessonForm.xpReward}
            onChange={e=>setLessonForm(v=>({...v,xpReward:Number(e.target.value)}))}/></label>
          <label className="admin-field">Moedas por conclusão<input type="number" min={0} max={10000} value={lessonForm.coinReward}
            onChange={e=>setLessonForm(v=>({...v,coinReward:Number(e.target.value)}))}/></label>
          <label className="admin-checkbox-row"><input type="checkbox" checked={lessonForm.published}
            onChange={e=>setLessonForm(v=>({...v,published:e.target.checked}))}/> Publicada para alunos</label>
        </div>
        <p className="admin-learning-help">Uma nova lição começa como rascunho. Crie ao menos uma questão antes de publicá-la.</p>
        <div className="admin-form-actions"><button className="admin-secondary-button" type="button" onClick={()=>setShowLesson(false)}>Cancelar</button>
          <button type="submit" className="admin-action-primary" disabled={busy}><Save size={17}/> Salvar lição</button></div>
      </form></div>}
      <div className="admin-learning-card-grid">{lessons.map(l=><article key={l.id} className="admin-learning-card">
        <div className="admin-learning-card-heading"><span className="admin-learning-card-emoji">{l.icon}</span>
          <span><strong>{l.title}</strong><small>{paths.find(p=>p.id===l.pathId)?.title||"Sem trilha"} · {l.questions.length} questões</small></span></div>
        <p>{l.description||"Sem descrição"}</p>
        <div className="admin-learning-card-foot">
          <span className={`admin-learning-chip${!l.published?" draft":""}`}>
            {l.published?"Publicada":"Rascunho"} · +{l.xpReward} XP · {l.coinReward} moedas</span>
          <div className="admin-form-actions">
            <button type="button" className="admin-minor" onClick={()=>{setLessonId(l.id);setTab("questions");setShowQuestion(false);}}>
              <ClipboardList size={15}/> Questões</button>
            <button type="button" className="admin-minor" onClick={()=>editLesson(l)}><Pencil size={15}/> Editar</button>
          </div>
        </div>
      </article>)}
      {!lessons.length&&<div className="admin-inline-empty">Crie a primeira lição dentro de uma trilha.</div>}</div>
    </section>}
    {tab==="questions"&&<section className="admin-learning-editor">
      <div className="admin-panel-heading"><div><h2>Questões interativas</h2>
        <p className="admin-learning-help">Crie exercícios compatíveis com as seis modalidades de resposta do aluno.</p></div>
        <button type="button" className="admin-action-primary" disabled={!currentLesson} onClick={addQuestion}><Plus size={17}/> Nova questão</button></div>
      <label className="admin-field">Lição selecionada<select value={lessonId} onChange={e=>{setLessonId(e.target.value);setShowQuestion(false);}}>
        {lessons.map(l=><option value={l.id} key={l.id}>{l.title}</option>)}</select></label>
      {showQuestion&&<div className={questionEditing?"admin-dialog-backdrop":""}>
      <form role={questionEditing?"dialog":undefined} aria-modal={questionEditing?true:undefined} aria-label={questionEditing?"Editar questão":undefined} className={questionEditing?"admin-dialog admin-modal-large admin-learning-modal":"admin-panel"} onSubmit={submitQuestion}>
        <div className="admin-panel-heading"><h2>{questionEditing?"Editar questão":"Nova questão"}</h2>
          <button className="admin-icon-button" type="button" aria-label="Fechar" onClick={()=>setShowQuestion(false)}><X size={20}/></button></div>
        <div className="admin-fields">
          <label className="admin-field">Modelo de questão<select value={questionForm.kind}
            onChange={e=>setQuestionForm({...blankQuestion,kind:e.target.value as Kind,position:questionForm.position})}>
            {kinds.map(k=><option key={k.value} value={k.value}>{k.label}</option>)}</select></label>
          <label className="admin-field">Ordem<input type="number" value={questionForm.position} min={0} max={10000}
            onChange={e=>setQuestionForm(v=>({...v,position:Number(e.target.value)}))}/></label>
          <label className="admin-field full">Enunciado<textarea required minLength={4} maxLength={600}
            value={questionForm.prompt} onChange={e=>setQuestionForm(v=>({...v,prompt:e.target.value}))}/></label>
          {questionForm.kind!=="TRUE_FALSE"&&questionForm.kind!=="FILL_BLANK"&&questionForm.kind!=="TRANSLATION"&&
            <label className="admin-field full">{questionForm.kind==="MATCHING"?"Pares para associação":"Opções ou palavras (uma por linha)"}
              <textarea required rows={5} value={questionForm.optionsText} maxLength={2000}
                onChange={e=>setQuestionForm(v=>({...v,optionsText:e.target.value}))}
                placeholder={questionForm.kind==="MATCHING"?"Thank you = Obrigado | Por favor | Tchau\nPlease = Por favor | Obrigado | Tchau":"Hello!\nGoodbye!\nPlease!"}/></label>}
          {questionForm.kind==="TRUE_FALSE"?
            <label className="admin-field">Resposta correta<select value={questionForm.answerText||"Verdadeiro"}
              onChange={e=>setQuestionForm(v=>({...v,answerText:e.target.value}))}>
              <option value="Verdadeiro">Verdadeiro</option><option value="Falso">Falso</option></select></label>
          : questionForm.kind!=="MATCHING"&&<label className="admin-field full">
              {questionForm.kind==="MULTIPLE_CHOICE"?"Resposta correta (igual a uma opção)":questionForm.kind==="ORDER_WORDS"?"Ordem correta (uma palavra por linha)":"Respostas aceitas (uma por linha)"}
              <textarea required rows={3} value={questionForm.answerText} maxLength={1200}
                onChange={e=>setQuestionForm(v=>({...v,answerText:e.target.value}))}
                placeholder={questionForm.kind==="ORDER_WORDS"?"I\nlike\nEnglish":questionForm.kind==="MULTIPLE_CHOICE"?"Hello!":"I like English"}/></label>}
          <label className="admin-field full">Explicação (opcional)<textarea maxLength={500}
            value={questionForm.explanation} onChange={e=>setQuestionForm(v=>({...v,explanation:e.target.value}))}/></label>
        </div>
        {questionForm.kind==="MATCHING"&&<p className="admin-learning-help">
          Formato: expressão = resposta correta | alternativa | alternativa. Uma expressão por linha.</p>}
        {questionForm.kind==="ORDER_WORDS"&&<p className="admin-learning-help">
          As palavras e a resposta devem conter exatamente os mesmos itens, apenas em ordem diferente.</p>}
        <div className="admin-form-actions"><button className="admin-secondary-button" type="button" onClick={()=>setShowQuestion(false)}>Cancelar</button>
          <button className="admin-action-primary" type="submit" disabled={busy}><Save size={16}/> Salvar questão</button></div>
      </form></div>}
      <div className="admin-panel">
        <div className="admin-panel-heading"><h2>{currentLesson?.title||"Selecione uma lição"}</h2>
          <span className="admin-learning-chip">{currentLesson?.questions.length||0} questões</span></div>
        {currentLesson?.questions.map((q,i)=><div className="admin-learning-question" key={q.id}>
          <span>{i+1}.</span><div><strong>{q.prompt}</strong>
            <small>{kinds.find(k=>k.value===q.kind)?.label||q.kind}</small></div>
          <button className="admin-icon-button" type="button" aria-label="Editar questão"
            onClick={()=>editQuestion(q)}><Pencil size={17}/></button>
        </div>)}
        {!currentLesson?.questions.length&&<p className="admin-inline-empty">Nenhuma questão cadastrada nessa lição.</p>}
      </div>
    </section>}
  </div>;
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, GraduationCap, Link2, Plus, Save, UsersRound } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type Classroom = { id: string; name: string };
type Guardian = { id: string; name: string; preferred?: boolean };
type Student = { id: string; name: string; guardians?: Guardian[] };

function useSave(url: string, returnTo: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (payload: object) => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await readApiJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      router.push(returnTo); router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao salvar. Tente novamente.");
      setBusy(false);
    }
  };
  return { busy, error, save };
}

export function AdminCreatePage({ back, eyebrow, title, description, children }: {
  back: string; eyebrow: string; title: string; description: string; children: React.ReactNode;
}) {
  return <div className="admin-content admin-create-page">
    <Link className="admin-back" href={back}><ArrowLeft size={17}/> Voltar para listagem</Link>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">{eyebrow}</p>
      <h1>{title}</h1><p>{description}</p></div></div>
    <div className="admin-create-card">{children}</div>
  </div>;
}

function FormButtons({ busy, back, label }: { busy: boolean; back: string; label: string }) {
  return <div className="admin-form-actions">
    <Link className="admin-secondary-button" href={back}>Cancelar</Link>
    <button type="submit" className="admin-action-primary" disabled={busy}>
      <Save size={17}/>{busy ? "Salvando..." : label}
    </button>
  </div>;
}

export function StudentRegistrationForm({ classrooms }: { classrooms: Classroom[] }) {
  const { busy, error, save } = useSave("/api/admin/students", "/admin/students");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classroomId, setClassroomId] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save({ name, nickname, email, password, classroomId: classroomId || undefined });
  }
  return <form onSubmit={submit} className="admin-create-form">
    <div className="admin-create-section"><span><GraduationCap size={22}/></span>
      <div><h2>Dados do aluno</h2><p>Informações básicas e credenciais para acessar o Willingue.</p></div></div>
    <div className="admin-fields">
      <label className="admin-field">Nome completo<input required minLength={2} maxLength={100}
        value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo"/></label>
      <label className="admin-field">Apelido <small>(exibido no aplicativo)</small>
        <input maxLength={32} value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Ex.: Bia"/></label>
      <label className="admin-field">E-mail de acesso<input required type="email" autoComplete="off"
        maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="aluno@exemplo.com"/></label>
      <label className="admin-field">Senha inicial<input required minLength={8} maxLength={120}
        autoComplete="new-password" type="password" value={password} onChange={e=>setPassword(e.target.value)}
        placeholder="Mínimo de 8 caracteres"/></label>
      <label className="admin-field full">Turma <small>(opcional)</small>
        <select value={classroomId} onChange={e=>setClassroomId(e.target.value)}>
          <option value="">Sem turma por enquanto</option>
          {classrooms.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}
        </select></label>
    </div>
    <p className="admin-muted-note">Você poderá vincular responsáveis, ajustar o perfil e atribuir trilhas após o cadastro.</p>
    {error&&<p className="admin-feedback error" role="alert">{error}</p>}
    <FormButtons busy={busy} back="/admin/students" label="Cadastrar aluno"/>
  </form>;
}

export function ClassroomRegistrationForm() {
  const { busy, error, save } = useSave("/api/admin/classrooms", "/admin/classrooms");
  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  function submit(event:FormEvent<HTMLFormElement>) {event.preventDefault();void save({name,description});}
  return <form onSubmit={submit} className="admin-create-form">
    <div className="admin-create-section"><span><UsersRound size={22}/></span>
      <div><h2>Dados da turma</h2><p>Crie uma turma e depois adicione alunos existentes.</p></div></div>
    <div className="admin-fields">
      <label className="admin-field full">Nome da turma<input required minLength={2} maxLength={80}
        value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Inglês A1 — Segunda-feira"/></label>
      <label className="admin-field full">Descrição<textarea maxLength={240}
        value={description} onChange={e=>setDescription(e.target.value)}
        placeholder="Horário, nível ou informações da turma"/></label>
    </div>
    {error&&<p className="admin-feedback error" role="alert">{error}</p>}
    <FormButtons busy={busy} back="/admin/classrooms" label="Cadastrar turma"/>
  </form>;
}

export function GuardianRegistrationForm() {
  const {busy,error,save}=useSave("/api/admin/guardians","/admin/guardians");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();void save({name,email,password});}
  return <form className="admin-create-form" onSubmit={submit}>
    <div className="admin-create-section"><span><UsersRound size={22}/></span><div>
      <h2>Dados do responsável</h2><p>Uma mesma conta poderá acompanhar mais de um aluno.</p></div></div>
    <div className="admin-fields">
      <label className="admin-field full">Nome completo<input required minLength={2} maxLength={100}
        value={name} onChange={e=>setName(e.target.value)}/></label>
      <label className="admin-field">E-mail<input type="email" required maxLength={254}
        autoComplete="off" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label className="admin-field">Senha inicial<input type="password" autoComplete="new-password"
        minLength={8} maxLength={120} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    </div>
    <p className="admin-muted-note">Após cadastrar, use “Vincular aluno” para definir quais estudantes essa pessoa acompanha.</p>
    {error&&<p className="admin-feedback error" role="alert">{error}</p>}
    <FormButtons busy={busy} back="/admin/guardians" label="Cadastrar responsável"/>
  </form>;
}

export function GuardianLinkForm({ guardians, students }: {
  guardians: Guardian[]; students: Student[];
}) {
  const {busy,error,save}=useSave("/api/admin/guardians/links","/admin/guardians");
  const [guardianId,setGuardianId]=useState("");
  const [studentId,setStudentId]=useState("");
  const [financialResponsible,setFinancialResponsible]=useState(false);
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();void save({guardianId,studentId,financialResponsible});
  }
  return <form className="admin-create-form" onSubmit={submit}>
    <div className="admin-create-section"><span><Link2 size={22}/></span><div>
      <h2>Associar responsável ao aluno</h2><p>Um aluno pode ter vários responsáveis e vice-versa.</p></div></div>
    <div className="admin-fields">
      <label className="admin-field">Responsável<select required value={guardianId}
        onChange={e=>setGuardianId(e.target.value)}><option value="">Selecione</option>
        {guardians.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      <label className="admin-field">Aluno<select required value={studentId}
        onChange={e=>setStudentId(e.target.value)}><option value="">Selecione</option>
        {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="admin-checkbox-row full"><input type="checkbox" checked={financialResponsible}
        onChange={e=>setFinancialResponsible(e.target.checked)}/>
        Pode ser responsável financeiro deste aluno
      </label>
    </div>
    {error&&<p className="admin-feedback error" role="alert">{error}</p>}
    <FormButtons busy={busy} back="/admin/guardians" label="Salvar vínculo"/>
  </form>;
}

export function ChargeRegistrationForm({ students, initialStudentId }: {
  students: Student[]; initialStudentId?: string;
}) {
  const {busy,error,save}=useSave("/api/admin/charges","/admin/finance");
  const [studentId,setStudentId]=useState(initialStudentId||"");
  const [title,setTitle]=useState("Mensalidade de inglês");
  const [amount,setAmount]=useState("");
  const [dueDate,setDueDate]=useState("");
  const [payerType,setPayerType]=useState<"STUDENT"|"GUARDIAN">("GUARDIAN");
  const [guardianId,setGuardianId]=useState("");
  const selectedStudent=students.find(s=>s.id===studentId);
  const guardians=selectedStudent?.guardians||[];
  const payer=guardians.some(g=>g.id===guardianId)?guardianId:
    guardians.find(g=>g.preferred)?.id||guardians[0]?.id||null;
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();void save({studentId,title,amount,dueDate,payerType,
      payerGuardianId:payerType==="GUARDIAN"?payer:null});
  }
  return <form className="admin-create-form" onSubmit={submit}>
    <div className="admin-create-section"><span><CreditCard size={22}/></span><div>
      <h2>Dados da cobrança</h2><p>Os pagamentos são informativos e confirmados manualmente pela escola.</p></div></div>
    <div className="admin-fields">
      <label className="admin-field">Aluno<select required value={studentId}
        onChange={e=>{setStudentId(e.target.value);setGuardianId("");}}>
        <option value="">Selecione um aluno</option>
        {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="admin-field">Descrição<input required minLength={3} maxLength={120}
        value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label className="admin-field">Valor (R$)<input required inputMode="decimal" placeholder="189,90"
        value={amount} onChange={e=>setAmount(e.target.value)}/></label>
      <label className="admin-field">Data de vencimento<input type="date" required value={dueDate}
        onChange={e=>setDueDate(e.target.value)}/></label>
      <label className="admin-field">Pagante<select value={payerType}
        onChange={e=>setPayerType(e.target.value as "STUDENT"|"GUARDIAN")}>
        <option value="GUARDIAN">Responsável</option>
        <option value="STUDENT">O próprio aluno</option></select></label>
      {payerType==="GUARDIAN"&&<label className="admin-field">Responsável financeiro
        <select required value={payer||""} onChange={e=>setGuardianId(e.target.value)}
          disabled={!guardians.length}>
          {!guardians.length&&<option value="">Vincule um responsável primeiro</option>}
          {guardians.map(g=><option key={g.id} value={g.id}>
            {g.name}{g.preferred?" · preferencial":""}</option>)}
        </select></label>}
    </div>
    {payerType==="GUARDIAN"&&!guardians.length&&studentId&&
      <p className="admin-feedback error">Este aluno não possui responsável vinculado.
        <Link href="/admin/guardians/link"> Vincular responsável</Link></p>}
    {error&&<p className="admin-feedback error" role="alert">{error}</p>}
    <FormButtons busy={busy} back="/admin/finance" label="Cadastrar cobrança"/>
  </form>;
}

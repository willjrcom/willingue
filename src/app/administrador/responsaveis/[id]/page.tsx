import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CalendarClock, CheckCircle2, CreditCard, GraduationCap, Mail, UsersRound, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { childOverview } from "@/lib/guardian";
import { chargeStatus, formatDueDate, formatMoney } from "@/lib/finance";
import { AdminGuardianEditor } from "@/components/admin-guardian-editor";
export const metadata={title:"Detalhes do responsável"};
export default async function AdminGuardianDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const guardian=await db.user.findFirst({where:{id,role:"GUARDIAN"},
  include:{guardianLinks:{include:{student:{include:{
   user:{select:{name:true,email:true}},
   classrooms:{include:{classroom:{select:{name:true}}}},
  }}}}}}});
 if(!guardian)notFound();
 const ids=guardian.guardianLinks.map(l=>l.studentId);
 const [children,charges]=await Promise.all([
  Promise.all(guardian.guardianLinks.map(async link=>({link,overview:await childOverview(link.studentId)}))),
  ids.length?db.charge.findMany({where:{studentId:{in:ids}},orderBy:{dueAt:"desc"},
    include:{student:{include:{user:{select:{name:true}}}}},payerGuardian:{select:{name:true}}}}):Promise.resolve([]),
 ]);
 const open=charges.filter(c=>["PENDING","OVERDUE"].includes(chargeStatus(c)));
 const paid=charges.filter(c=>chargeStatus(c)==="PAID");
 return <div className="admin-content">
  <Link href="/administrador/responsaveis" className="admin-back"><ArrowLeft size={17}/> Voltar aos responsáveis</Link>
  <div className="admin-page-heading"><div><p className="admin-eyebrow">ACOMPANHAMENTO FAMILIAR</p>
   <h1>{guardian.name}</h1><p><Mail size={15} style={{verticalAlign:"middle"}}/> {guardian.email}</p></div>
   <AdminGuardianEditor id={guardian.id} name={guardian.name} email={guardian.email}/>
  </div>
  <section className="admin-dash-insights">
   <div><span><UsersRound size={22}/></span><strong>{children.length}</strong><small>Filhos/alunos vinculados</small></div>
   <div><span><BookOpen size={22}/></span><strong>{children.reduce((n,c)=>n+c.overview.completed,0)}</strong><small>Lições concluídas</small></div>
   <div><span><Wallet size={22}/></span><strong>{formatMoney(open.reduce((n,c)=>n+c.amountCents,0))}</strong><small>Em aberto</small></div>
   <div><span><CheckCircle2 size={22}/></span><strong>{paid.length}</strong><small>Pagamentos registrados</small></div>
  </section>
  <section className="admin-panel">
   <div className="admin-panel-heading"><div><p className="admin-eyebrow">FILHOS E APRENDIZADO</p><h2>Alunos acompanhados</h2></div>
    <Link href="/administrador/responsaveis/vincular">Vincular aluno <ArrowRight size={16}/></Link></div>
   <div className="admin-guardian-children">
    {children.map(({link,overview})=><article className="admin-guardian-child" key={link.studentId}>
     <div className="admin-guardian-child-head"><span>{link.student.selectedAvatar||"🎓"}</span><div>
      <strong>{link.student.nickname||link.student.user.name}</strong>
      <small>{link.student.classrooms.map(c=>c.classroom.name).join(", ")||"Estudo individual"}
       {link.financialResponsible?" · Responsável financeiro":""}</small></div>
      <Link href={`/administrador/alunos/${link.studentId}`} aria-label="Abrir perfil do aluno"><ArrowRight size={18}/></Link></div>
     <div className="guardian-progress-track"><span style={{width:`${overview.percent}%`}}/></div>
     <div className="guardian-progress-meta"><strong>{overview.percent}% do conteúdo disponível</strong>
      <span>{overview.completed}/{overview.total} lições</span></div>
     <div className="admin-guardian-child-stats">
      <span><GraduationCap size={17}/> {overview.recentWeekCount} lição(ões) nos últimos 7 dias</span>
      <span><CalendarClock size={17}/> {overview.activity.length} tarefa(s) pendente(s)</span>
     </div>
     <div className="admin-guardian-tasks">
      <strong>Últimas lições realizadas</strong>
      {overview.recent.length ? overview.recent.slice(0,3).map(c=><div key={c.id}>
       <span>{c.lesson.icon}</span><p>{c.lesson.title} · {c.score}% de acerto</p>
       <small>{formatDueDate(c.completedAt)}</small></div>) : <p>Sem lições concluídas ainda.</p>}
      <strong>Atividades pendentes</strong>
      {overview.activity.length ? overview.activity.slice(0,3).map(a=><div key={a.id}>
       <span>{a.lesson.icon}</span><p>{a.lesson.title}</p>
       <small>Até {formatDueDate(a.dueAt)}</small></div>):<p>Nenhuma atividade pendente.</p>}
     </div>
     <Link className="admin-guardian-more" href={`/administrador/alunos/${link.studentId}`}>Ver histórico e trilhas do aluno <ArrowRight size={16}/></Link>
    </article>)}
    {!children.length&&<div className="admin-inline-empty">Nenhum aluno vinculado a este responsável.</div>}
   </div>
  </section>
  <section className="admin-panel">
   <div className="admin-panel-heading"><div><p className="admin-eyebrow">CONTAS DOS ALUNOS</p><h2>Situação financeira</h2></div>
    <Link href="/administrador/financeiro">Abrir financeiro <ArrowRight size={16}/></Link></div>
   <div className="admin-guardian-finance-totals"><span><CreditCard size={18}/> {charges.length} cobranças</span>
    <span><Wallet size={18}/> {formatMoney(open.reduce((n,c)=>n+c.amountCents,0))} em aberto</span></div>
   {charges.length ? <div className="admin-guardian-charge-list">{charges.map(c=><div key={c.id}>
    <div><strong>{c.title}</strong><small>Aluno: {c.student.nickname||c.student.user.name} · Vencimento: {formatDueDate(c.dueAt)}</small>
     <small>Pagante: {c.payerType==="STUDENT"?"Aluno":c.payerGuardian?.name||"Responsável"}</small></div>
    <div><strong>{formatMoney(c.amountCents)}</strong><span className={`finance-status finance-status-${chargeStatus(c).toLowerCase()}`}>
     {chargeStatus(c)==="PAID"?"Pago":chargeStatus(c)==="OVERDUE"?"Atrasado":chargeStatus(c)==="CANCELED"?"Cancelado":"A vencer"}</span></div>
   </div>)}</div>:<div className="admin-inline-empty">Não existem cobranças para os alunos vinculados.</div>}
   <p className="admin-muted-note">Registros financeiros são informativos; pagamentos são confirmados pela escola.</p>
  </section>
 </div>;
}

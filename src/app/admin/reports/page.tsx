import Link from "next/link";
import { BarChart3, BookOpen, ChartNoAxesCombined, CircleAlert, CreditCard, GraduationCap, TrendingUp, Download } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/finance";
import { daysForPeriod, getAdminReport } from "@/lib/admin-reports";
import { ReportFilters } from "@/components/admin-report-filters";

export const metadata={title:"Relatórios"};
export default async function AdminReports({searchParams}:{searchParams:Promise<{periodo?:string;turma?:string}>}){
 const params=await searchParams;
 const days=daysForPeriod(params.periodo);
 const classes=await db.classroom.findMany({select:{id:true,name:true}});
 const classId=params.turma&&classes.some(c=>c.id===params.turma)?params.turma:undefined;
 const report=await getAdminReport(days,classId);
 const max=Math.max(1,...report.daily.map(item=>item.count));
 const dates=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short"});
 const exportUrl=`/api/admin/reports/export?periodo=${days}${classId?"&turma="+encodeURIComponent(classId):""}`;
 return <div className="admin-content">
  <div className="admin-page-heading"><div><p className="admin-eyebrow">INDICADORES DA ESCOLA</p><h1>Relatórios</h1>
   <p>Consulte o desempenho real de aprendizagem e a situação financeira da escola.</p></div>
   <a className="admin-action-primary" href={exportUrl}><Download size={17}/> Exportar CSV</a>
  </div>
  <ReportFilters period={days} classroomId={classId||""} classrooms={classes}/>
  <section className="admin-dash-cards">
   {[
    {icon:GraduationCap,label:"Alunos no recorte",value:String(report.students),hint:"Alunos cadastrados no grupo",tone:"purple"},
    {icon:BookOpen,label:"Lições concluídas",value:String(report.completed),hint:`Últimos ${days} dias`,tone:"blue"},
    {icon:TrendingUp,label:"Alunos com atividade",value:`${report.activePercentage}%`,hint:`${report.activeStudents} estudantes ativos`,tone:"mint"},
    {icon:CreditCard,label:"Em aberto",value:formatMoney(report.charges.openAmount),hint:`${report.charges.overdue.length} cobranças atrasadas`,tone:"orange"},
   ].map(card=>{const Icon=card.icon;return <div className="admin-dash-card" key={card.label}>
    <span className={`admin-dash-icon ${card.tone}`}><Icon size={22}/></span>
    <small>{card.label}</small><strong>{card.value}</strong><span className="admin-dash-hint">{card.hint}</span></div>;})}
  </section>
  <div className="admin-dashboard-columns">
   <section className="admin-panel">
    <div className="admin-panel-heading"><div><p className="admin-eyebrow">ENGAJAMENTO</p><h2>Lições concluídas por dia</h2></div><BarChart3 size={22}/></div>
    <div className="admin-report-chart" role="img" aria-label="Gráfico de lições concluídas por dia">
     {report.daily.map((point,index)=><div key={point.date} title={`${point.date}: ${point.count} lições`} className="admin-report-bar-col">
      <span style={{height:`${Math.max(point.count?7:2,point.count/max*100)}%`}}/>
      {(days===7||index%(days===30?5:14)===0)&&<small>{dates.format(new Date(point.date+"T12:00:00Z"))}</small>}
     </div>)}
    </div>
    <p className="admin-muted-note">Somente conclusões registradas no banco de dados. Repetir uma lição não duplica seu total.</p>
   </section>
   <section className="admin-panel">
    <div className="admin-panel-heading"><div><p className="admin-eyebrow">RESULTADOS</p><h2>Desempenho dos exercícios</h2></div><ChartNoAxesCombined size={22}/></div>
    <div className="admin-report-performance">
     <div><small>Tentativas registradas</small><strong>{report.attempts}</strong></div>
     <div><small>Nota média das tentativas</small><strong>{report.meanScore!==null?`${report.meanScore}%`:"—"}</strong></div>
     <div><small>Taxa de aprovação</small><strong>{report.passing!==null?`${report.passing}%`:"—"}</strong></div>
    </div>
    <div className="admin-report-financial">
     <div><span><CreditCard size={19}/> Pagamentos registrados</span><strong>{formatMoney(report.charges.paidAmount)}</strong></div>
     <div><span><CircleAlert size={19}/> Cobranças em atraso</span><strong>{report.charges.overdue.length}</strong></div>
     <Link href="/admin/finance">Abrir gestão financeira</Link>
    </div>
   </section>
  </div>
  <section className="admin-panel">
   <div className="admin-panel-heading"><div><p className="admin-eyebrow">PROGRESSO INDIVIDUAL</p><h2>Alunos no período</h2></div><span className="admin-learning-chip">{report.ranking.length} alunos</span></div>
   <div className="admin-report-table-wrap"><table className="admin-report-table">
    <thead><tr><th>Aluno</th><th>Turma</th><th>Lições concluídas</th><th>XP acumulado</th><th>Última atividade</th></tr></thead>
    <tbody>{report.ranking.map(s=><tr key={s.id}>
     <td><Link href={`/admin/students/${s.id}`}><span>{s.avatar}</span>{s.name}</Link></td>
     <td>{s.classrooms.join(", ")||"Sem turma"}</td><td><strong>{s.completed}</strong></td><td>{s.xp}</td>
     <td>{s.lastActivity?dates.format(new Date(s.lastActivity)):"Não registrada"}</td>
    </tr>)}</tbody>
   </table>
   {!report.ranking.length&&<div className="admin-inline-empty">Nenhum aluno encontrado neste filtro.</div>}
   </div>
   <p className="admin-muted-note">XP é acumulado desde o cadastro; as lições são filtradas pelo período. Atividade significa conclusão registrada, não presença em aula.</p>
  </section>
 </div>;
}

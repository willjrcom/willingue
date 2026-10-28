"use client";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
export function ReportFilters({period,classroomId,classrooms}:{period:number;classroomId:string;classrooms:Array<{id:string;name:string}>}){
 const router=useRouter();
 function change(days:number,id:string){
  const query=new URLSearchParams({periodo:String(days)});
  if(id)query.set("turma",id);
  router.push("/admin/reports?"+query.toString());
 }
 return <div className="admin-report-filters">
  <div className="admin-report-period" aria-label="Intervalo de tempo">{[7,30,90].map(day=>
   <button type="button" className={period===day?"active":""} key={day} onClick={()=>change(day,classroomId)}>
    {day} dias</button>)}</div>
  <label className="admin-searchbox"><Filter size={18}/>
   <select aria-label="Filtrar por turma" value={classroomId} onChange={e=>change(period,e.target.value)}>
    <option value="">Todas as turmas</option>{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
   </select></label>
 </div>;
}

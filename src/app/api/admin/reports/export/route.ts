import { isAuthorizedAdmin } from "@/lib/admin-access";
import { jsonError } from "@/lib/api";
import { daysForPeriod, getAdminReport } from "@/lib/admin-reports";
import { db } from "@/lib/db";

// Protect spreadsheet users against formula injection in exported cells.
function csv(value: string | number) {
 const raw=String(value);
 const protectedText=/^[\s]*[=+@-]/.test(raw)?"'"+raw:raw;
 return '"'+protectedText.replaceAll('"','""')+'"';
}
export async function GET(request:Request){
 // GET endpoints do not send Origin; session and ADMIN role are still required.
 if(!(await isAuthorizedAdmin(request)))return jsonError("Acesso não autorizado.",403);
 const url=new URL(request.url);
 const days=daysForPeriod(url.searchParams.get("periodo")||undefined);
 const requested=url.searchParams.get("turma")||undefined;
 const classroomId=requested&&await db.classroom.findUnique({where:{id:requested},select:{id:true}})
  ?requested:undefined;
 const report=await getAdminReport(days,classroomId);
 const records=[["Aluno","Turmas","Lições concluídas no período","XP acumulado","Última lição concluída"],
  ...report.ranking.map(s=>[s.name,s.classrooms.join(" | "),String(s.completed),
   String(s.xp),s.lastActivity||""])];
 const content="\uFEFF"+records.map(row=>row.map(csv).join(";")).join("\r\n");
 return new Response(content,{headers:{
  "Content-Type":"text/csv; charset=utf-8",
  "Content-Disposition":`attachment; filename="willingue-relatorio-${days}-dias.csv"`,
  "Cache-Control":"no-store",
 }});
}

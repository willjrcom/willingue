import { db } from "@/lib/db";
import { chargeStatus } from "@/lib/finance";

export function daysForPeriod(value: string | undefined): 7 | 30 | 90 {
  return value === "7" ? 7 : value === "90" ? 90 : 30;
}

export function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export async function getAdminReport(days: 7|30|90, classroomId?: string) {
  const since = new Date(Date.now()-days*86400000);
  const [students, completions, attempts, charges, classes] = await Promise.all([
    db.studentProfile.findMany({
      where: classroomId ? {classrooms:{some:{classroomId}}} : {},
      include:{ user:{select:{name:true}},
        classrooms:{include:{classroom:{select:{name:true}}}} },
      orderBy:{user:{name:"asc"}},
    }),
    db.lessonCompletion.findMany({
      where:{completedAt:{gte:since}, ...(classroomId?{student:{classrooms:{some:{classroomId}}}}:{})},
      select:{studentId:true,completedAt:true,score:true},
    }),
    db.lessonAttempt.findMany({
      where:{submittedAt:{gte:since},...(classroomId?{student:{classrooms:{some:{classroomId}}}}:{})},
      select:{studentId:true,score:true,passed:true},
    }),
    db.charge.findMany({
      where: classroomId ? {student:{classrooms:{some:{classroomId}}}} : {},
      include:{student:{include:{user:{select:{name:true}}}}},
      orderBy:{dueAt:"desc"},
    }),
    db.classroom.findMany({select:{id:true,name:true},orderBy:{name:"asc"}}),
  ]);
  const scores = new Map<string,number>();
  for(const c of completions)scores.set(c.studentId,(scores.get(c.studentId)||0)+1);
  const startOfPeriod = students.filter(s=>(scores.get(s.id)||0)>0).length;
  const activePercentage = students.length ? Math.round(startOfPeriod/students.length*100) : 0;
  const meanScore = attempts.length ? Math.round(attempts.reduce((a,t)=>a+t.score,0)/attempts.length) : null;
  const passing = attempts.length ? Math.round(attempts.filter(a=>a.passed).length/attempts.length*100) : null;
  const pending = charges.filter(c=>chargeStatus(c)==="PENDING");
  const overdue = charges.filter(c=>chargeStatus(c)==="OVERDUE");
  const paid = charges.filter(c=>chargeStatus(c)==="PAID");
  const byDay = new Map<string,number>();
  for (const c of completions) {
    const day=dateKey(c.completedAt);byDay.set(day,(byDay.get(day)||0)+1);
  }
  const daily = Array.from({length:days},(_,index)=>{
    const day=new Date(); day.setUTCDate(day.getUTCDate()-(days-1-index));
    return {date:dateKey(day),count:byDay.get(dateKey(day))||0};
  });
  const ranking=students.map(s=>({
    id:s.id,name:s.nickname||s.user.name,avatar:s.selectedAvatar||"🎓",
    classrooms:s.classrooms.map(c=>c.classroom.name),
    completed:scores.get(s.id)||0,
    xp:s.xp,
    lastActivity:s.lastCompletedAt?.toISOString()||null,
  })).sort((a,b)=>b.completed-a.completed||a.name.localeCompare(b.name,"pt-BR"));
  return {days,since,students:students.length,activeStudents:startOfPeriod,activePercentage,
    completed:completions.length,attempts:attempts.length,meanScore,passing,ranking,daily,
    charges:{pending,overdue,paid,openAmount:pending.concat(overdue).reduce((n,c)=>n+c.amountCents,0),
      paidAmount:paid.reduce((n,c)=>n+c.amountCents,0)},
    classrooms:classes};
}

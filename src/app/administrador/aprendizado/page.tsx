import { BookOpen, Layers3, ListChecks, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { AdminLearningManager } from "@/components/admin-learning-manager";

export const metadata={title:"Aprendizado"};
export default async function AdminLearningPage(){
  const [paths,lessons]=await Promise.all([
    db.learningPath.findMany({
      include:{_count:{select:{lessons:true,children:true}}},
      orderBy:[{position:"asc"},{title:"asc"}],
    }),
    db.lesson.findMany({
      include:{questions:{orderBy:[{position:"asc"}]},_count:{select:{completions:true}}},
      orderBy:[{position:"asc"},{title:"asc"}],
    }),
  ]);
  return <div className="admin-content">
    <div className="admin-page-heading"><div>
      <p className="admin-eyebrow">CONTEÚDO PEDAGÓGICO</p>
      <h1>Aprendizado</h1><p>Organize trilhas, subtrilhas, lições e exercícios para seus alunos.</p>
    </div></div>
    <div className="admin-dash-insights">
      <div><span><Layers3 size={21}/></span><strong>{paths.length}</strong><small>Trilhas cadastradas</small></div>
      <div><span><BookOpen size={21}/></span><strong>{lessons.length}</strong><small>Lições cadastradas</small></div>
      <div><span><ListChecks size={21}/></span><strong>{lessons.reduce((n,l)=>n+l.questions.length,0)}</strong><small>Questões cadastradas</small></div>
      <div><span><Sparkles size={21}/></span><strong>{lessons.filter(l=>l.published).length}</strong><small>Lições publicadas</small></div>
    </div>
    <AdminLearningManager
      paths={paths.map(p=>({id:p.id,title:p.title,description:p.description,icon:p.icon,
        color:p.color,position:p.position,parentId:p.parentId,access:p.access,published:p.published,
        lessonCount:p._count.lessons,childCount:p._count.children}))}
      lessons={lessons.map(l=>({id:l.id,title:l.title,description:l.description,icon:l.icon,
        pathId:l.pathId,position:l.position,xpReward:l.xpReward,coinReward:l.coinReward,
        published:l.published,completionCount:l._count.completions,
        questions:l.questions.map(q=>({id:q.id,kind:q.kind,prompt:q.prompt,position:q.position,
          options:q.options,answer:q.answer,explanation:q.explanation||""}))}))}
    />
  </div>;
}

import { BookOpen, Database, GraduationCap, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { getSchoolSettings } from "@/lib/school-settings";
import { AdminSettingsForm } from "@/components/admin-settings-form";
export const metadata={title:"Configurações"};

export default async function AdminSettingsPage(){
 const [settings,users,paths,lessons]=await Promise.all([
  getSchoolSettings(),db.user.count(),db.learningPath.count(),db.lesson.count(),
 ]);
 const demo=process.env.DEMO_SEED==="true";
 return <div className="admin-content">
  <div className="admin-page-heading"><div><p className="admin-eyebrow">PREFERÊNCIAS DA INSTITUIÇÃO</p>
   <h1>Configurações</h1><p>Personalize a escola e ajuste os valores padrão de pontuação das próximas lições.</p></div>
  </div>
  <div className="admin-dashboard-columns admin-settings-sections">
   <AdminSettingsForm settings={{
    schoolName:settings.schoolName,description:settings.description,contactEmail:settings.contactEmail,
    defaultLessonXp:settings.defaultLessonXp,defaultLessonCoins:settings.defaultLessonCoins,
   }}/>
   <div className="admin-settings-column">
    <section className="admin-panel">
     <div className="admin-panel-heading"><div><p className="admin-eyebrow">AMBIENTE</p><h2>Situação da instalação</h2></div><Database size={22}/></div>
     <div className="admin-settings-meta">
      <div><span>Banco de dados</span><strong>SQLite / Prisma</strong></div>
      <div><span>Modo de demonstração</span><strong className={demo?"admin-demo-enabled":""}>{demo?"Ativado":"Desativado"}</strong></div>
      <div><span>Usuários cadastrados</span><strong>{users}</strong></div>
      <div><span>Trilhas cadastradas</span><strong>{paths}</strong></div>
      <div><span>Lições cadastradas</span><strong>{lessons}</strong></div>
     </div>
     <p className="admin-muted-note">A ativação ou desativação do modo demo é feita nas variáveis do Dokploy, nunca por esta tela.</p>
    </section>
    <section className="admin-panel">
     <div className="admin-panel-heading"><div><p className="admin-eyebrow">ACESSOS</p><h2>Segurança e permissões</h2></div><ShieldCheck size={22}/></div>
     <div className="admin-settings-feature"><UsersRound size={20}/><div><strong>Administrador</strong>
      <p>Gerencia alunos, responsáveis, cobranças e conteúdo escolar.</p></div></div>
     <div className="admin-settings-feature"><GraduationCap size={20}/><div><strong>Aluno</strong>
      <p>Visualiza apenas seu próprio aprendizado, turma e contas.</p></div></div>
     <div className="admin-settings-feature"><BookOpen size={20}/><div><strong>Responsável</strong>
      <p>Visualiza os alunos vinculados e suas cobranças.</p></div></div>
     <p className="admin-muted-note">Chaves secretas e senhas não são exibidas nem editadas aqui.</p>
    </section>
   </div>
  </div>
 </div>;
}

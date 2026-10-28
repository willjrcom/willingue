"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminNavigation } from "@/components/admin-navigation";
import { GuardianNav } from "@/components/guardian-nav";
import { StudentNav } from "@/components/student-nav";
import { ErrorPanel } from "@/components/error-panel";
export default function AppError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 const path=usePathname()||"";
 useEffect(()=>{console.error("Erro global de tela",error);},[error]);
 if(path.startsWith("/admin"))return <div className="admin-workspace">
  <AdminNavigation adminName="Administrador" email=""/><main className="admin-workspace-main">
   <div className="admin-content"><ErrorPanel code="500" title="Ocorreu um erro inesperado"
    description="Tente recarregar esta área ou navegue pelo menu." home="/admin" retry={reset}/></div>
  </main></div>;
 if(path.startsWith("/guardian"))return <div className="guardian-shell">
  <main className="guardian-container"><ErrorPanel code="500" title="Não foi possível carregar"
   description="Tente novamente ou use o menu inferior." home="/guardian" retry={reset}/></main>
  <GuardianNav/></div>;
 return <div className="app-shell"><main className="page-container"><ErrorPanel code="500"
  title="Não foi possível carregar" description="Tente novamente ou escolha outra área para continuar."
  home={path.startsWith("/login")?"/login":"/learn"} retry={reset}/></main>
  {!path.startsWith("/login")&&<StudentNav experience="adult"/>}</div>;
}

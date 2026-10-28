"use client";
import { useEffect } from "react";
import { ErrorPanel } from "@/components/error-panel";
export default function AdminError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error("Erro no administrador",error);},[error]);
 return <div className="admin-content"><ErrorPanel code="500" title="Não foi possível carregar esta tela"
  description="Ocorreu um problema temporário. Tente novamente ou use o menu lateral para continuar."
  home="/admin" retry={reset}/></div>;
}

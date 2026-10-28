"use client";
import { useEffect } from "react";
import { ErrorPanel } from "@/components/error-panel";
export default function StudentError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error("Erro do aluno",error);},[error]);
 return <div className="page-stack"><ErrorPanel code="500" title="Ops! Algo deu errado"
  description="Não conseguimos abrir este conteúdo. Que tal tentar novamente? Suas conquistas estão salvas."
  home="/aprender" retry={reset}/></div>;
}

"use client";
import { useEffect } from "react";
import { ErrorPanel } from "@/components/error-panel";
export default function GuardianError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error("Erro do responsável",error);},[error]);
 return <div className="guardian-stack"><ErrorPanel code="500" title="Não foi possível abrir esta área"
  description="Seus dados continuam protegidos. Você pode tentar novamente ou navegar pelo menu inferior."
  home="/responsavel" retry={reset}/></div>;
}

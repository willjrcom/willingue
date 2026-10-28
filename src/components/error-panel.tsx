"use client";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, RefreshCw, SearchX } from "lucide-react";
export function ErrorPanel({code,title,description,home,retry}:{
 code:"404"|"500";title:string;description:string;home:string;retry?:()=>void;
}){
 return <section className="willingue-error-page" role="status">
  <div className="willingue-error-icon">{code==="404"?<SearchX size={32}/>:<AlertTriangle size={32}/>}</div>
  <span className="willingue-error-code">ERRO {code}</span>
  <h1>{title}</h1><p>{description}</p>
  <div className="willingue-error-actions">
   {retry&&<button className="admin-action-primary" onClick={retry} type="button"><RefreshCw size={18}/> Tentar novamente</button>}
   <Link className={retry?"admin-secondary-button":"admin-action-primary"} href={home}><Home size={17}/> Voltar ao início</Link>
  </div>
  <small>O menu continua disponível para você acessar outras áreas.</small>
 </section>;
}

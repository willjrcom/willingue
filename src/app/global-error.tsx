"use client";
import { ErrorPanel } from "@/components/error-panel";
/** Fatal root layout errors have no reliable session/navigation state. */
export default function GlobalError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <html lang="pt-BR"><body style={{margin:0,fontFamily:"system-ui",background:"#f6f5ff"}}>
  <main style={{maxWidth:680,margin:"60px auto",padding:24}}>
   <ErrorPanel code="500" title="Não conseguimos iniciar o Willingue"
    description="Um problema inesperado impediu o carregamento. Tente novamente ou entre no aplicativo."
    home="/login" retry={reset}/>
   <nav style={{display:"flex",gap:15,flexWrap:"wrap",justifyContent:"center",marginTop:24}}>
    <a href="/administrador">Administração</a><a href="/responsavel">Responsável</a><a href="/aprender">Aluno</a>
   </nav>
  </main>
 </body></html>;
}

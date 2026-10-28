import { ErrorPanel } from "@/components/error-panel";
export default function GuardianNotFound(){
 return <div className="guardian-stack"><ErrorPanel code="404" title="Página não encontrada"
  description="Essa área não está disponível. Você pode acessar outra opção pelo menu inferior."
  home="/guardian"/></div>;
}

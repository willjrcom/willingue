import { ErrorPanel } from "@/components/error-panel";
export default function AdminNotFound(){
 return <div className="admin-content"><ErrorPanel code="404" title="Página não encontrada"
  description="Não encontramos essa área da administração. Confira o endereço ou escolha outra opção no menu."
  home="/administrador"/></div>;
}

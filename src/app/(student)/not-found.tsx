import { ErrorPanel } from "@/components/error-panel";
export default function StudentNotFound(){
 return <div className="page-stack"><ErrorPanel code="404" title="Essa página sumiu!"
  description="Mas seus estudos continuam aqui. Escolha uma atividade no menu ou volte para aprender."
  home="/learn"/></div>;
}

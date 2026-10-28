import Link from "next/link";
import { Link2, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { GuardianManager } from "@/components/guardian-manager";

export const metadata = { title: "Gerenciar responsáveis" };

export default async function AdminGuardiansPage() {
  const guardians = await db.user.findMany({
    where: { role: "GUARDIAN" },
    include: { guardianLinks: { include: { student: { include: {
      user: { select: { name: true } },
    } } } } },
    orderBy: { name: "asc" },
  });
  return <div className="admin-content">

      <div className="admin-page-heading"><div><p className="admin-eyebrow">GESTÃO FAMILIAR</p>
        <h1>Responsáveis</h1><p>Consulte os responsáveis e os alunos que cada um acompanha.</p></div>
        <div className="admin-heading-actions">
          <Link className="admin-secondary-button" href="/admin/guardians/link"><Link2 size={17}/> Vincular aluno</Link>
          <Link className="admin-action-primary" href="/admin/guardians/new"><Plus size={17}/> Cadastrar responsável</Link>
        </div>
      </div>
      <GuardianManager
        guardians={guardians.map(g => ({
          id: g.id, name: g.name, email: g.email,
          links: g.guardianLinks.map(l => ({
            studentId: l.studentId,
            name: l.student.nickname || l.student.user.name,
            financialResponsible: l.financialResponsible,
          })),
        }))}
      />

  </div>;
}

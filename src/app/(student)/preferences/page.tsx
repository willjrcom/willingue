import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { StudentExperienceSettings } from "@/components/student-experience-settings";
import { resolveExperience } from "@/lib/student-experience";

export const metadata = { title: "Preferências" };

export default async function PreferencesPage() {
  const { student } = await requireStudent();
  const experience = resolveExperience(student);
  return <div className="page-stack">
    <Link className="back-link" href="/profile"><ArrowLeft size={18}/> Voltar ao perfil</Link>
    <div className="page-title">
      <p className="eyebrow muted">PERSONALIZE SUA EXPERIÊNCIA</p>
      <h1>Preferências <Settings2 size={26} style={{ verticalAlign: "middle" }}/></h1>
      <p>Escolha como você prefere navegar e aprender no Willingue.</p>
    </div>
    <StudentExperienceSettings
      birthDate={student.birthDate?.toISOString().slice(0, 10) ?? null}
      preference={student.interfaceMode}
      effective={experience}
    />
  </div>;
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Gift, UserRound } from "lucide-react";
import type { StudentExperience } from "@/lib/student-experience";

const menu = [
  { href: "/aprender", label: "Aprender", icon: BookOpen },
  { href: "/atividades", label: "Atividades", icon: CalendarDays },
  { href: "/recompensas", label: "Prêmios", icon: Gift },
  { href: "/perfil", label: "Meu perfil", icon: UserRound },
];
const labels: Record<StudentExperience, [string, string, string, string]> = {
  kids: ["Aprender", "Atividades", "Prêmios", "Meu perfil"],
  teen: ["Trilhas", "Atividades", "Loja", "Perfil"],
  adult: ["Estudar", "Atividades", "Recompensas", "Perfil"],
};
export function StudentNav({ experience }: { experience: StudentExperience }) {
  const path = usePathname();
  return <nav className="bottom-nav" aria-label="Navegação do aluno">{menu.map((item, index) => {
    const active = path === item.href || (item.href === "/aprender" && (path.startsWith("/trilhas/") || path.startsWith("/licoes/")));
    const Icon = item.icon;
    return <Link key={item.href} href={item.href} className={`nav-item${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
      <Icon size={22} strokeWidth={active ? 2.6 : 2.1}/><span>{labels[experience][index]}</span>
    </Link>;
  })}</nav>;
}

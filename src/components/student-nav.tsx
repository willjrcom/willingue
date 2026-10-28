"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Gift, UserRound, UsersRound } from "lucide-react";
import type { StudentExperience } from "@/lib/student-experience";

const menu = [
  { href: "/learn", icon: BookOpen },
  { href: "/my-class", icon: UsersRound },
  { href: "/activities", icon: CalendarDays },
  { href: "/rewards", icon: Gift },
  { href: "/profile", icon: UserRound },
];

const labels: Record<StudentExperience, [string, string, string, string, string]> = {
  kids: ["Aprender", "Minha turma", "Atividades", "Prêmios", "Meu perfil"],
  teen: ["Trilhas", "Minha turma", "Atividades", "Loja", "Perfil"],
  adult: ["Estudar", "Minha turma", "Atividades", "Recompensas", "Perfil"],
};

export function StudentNav({ experience }: { experience: StudentExperience }) {
  const path = usePathname();
  return <nav className="bottom-nav" aria-label="Navegação do aluno">
    {menu.map((item, index) => {
      const active = path === item.href
        || (item.href === "/learn" && (path.startsWith("/paths/") || path.startsWith("/lessons/")));
      const Icon = item.icon;
      return <Link key={item.href} href={item.href}
        className={`nav-item${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
        <Icon size={22} strokeWidth={active ? 2.6 : 2.1}/>
        <span>{labels[experience][index]}</span>
      </Link>;
    })}
  </nav>;
}

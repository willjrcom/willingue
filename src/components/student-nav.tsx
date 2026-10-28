"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Gift, UserRound } from "lucide-react";

const menu = [
  { href: "/aprender", label: "Aprender", icon: BookOpen },
  { href: "/atividades", label: "Atividades", icon: CalendarDays },
  { href: "/recompensas", label: "Prêmios", icon: Gift },
  { href: "/perfil", label: "Meu perfil", icon: UserRound },
];
export function StudentNav() {
  const path = usePathname();
  return <nav className="bottom-nav" aria-label="Navegação do aluno">{menu.map(item => {
    const active = path === item.href || (item.href === "/aprender" && (path.startsWith("/trilhas/") || path.startsWith("/licoes/")));
    const Icon = item.icon;
    return <Link key={item.href} href={item.href} className={`nav-item${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
      <Icon size={22} strokeWidth={active ? 2.6 : 2.1}/><span>{item.label}</span>
    </Link>;
  })}</nav>;
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, House, CreditCard, UserRound } from "lucide-react";

const tabs = [
  { href: "/guardian", label: "Início", icon: House, exact: true },
  { href: "/guardian/students", label: "Aprendizado", icon: ChartNoAxesCombined },
  { href: "/guardian/finance", label: "Financeiro", icon: CreditCard },
  { href: "/guardian/profile", label: "Perfil", icon: UserRound },
];
export function GuardianNav() {
  const pathname = usePathname();
  return <nav className="guardian-nav" aria-label="Menu do responsável">
    {tabs.map(tab => {
      const current = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
      const Icon = tab.icon;
      return <Link key={tab.href} href={tab.href} className={current ? "active" : ""}
        aria-current={current ? "page" : undefined}>
        <Icon size={22} strokeWidth={current ? 2.6 : 2}/><span>{tab.label}</span>
      </Link>;
    })}
  </nav>;
}

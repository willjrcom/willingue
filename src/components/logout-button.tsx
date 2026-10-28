"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return <button className="logout-button" disabled={pending} onClick={async ()=>{
    setPending(true);
    try { const response = await fetch("/api/auth/logout", { method: "POST" }); if (!response.ok) throw new Error(); router.replace("/login"); router.refresh(); }
    catch { setPending(false); }
  }}><LogOut size={19}/>{pending ? "Saindo..." : "Sair da minha conta"}</button>;
}

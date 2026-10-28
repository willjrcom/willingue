import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AdminNavigation } from "@/components/admin-navigation";

export default async function AdministratorLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  return <div className="admin-workspace">
    <AdminNavigation adminName={user.name} email={user.email}/>
    <main className="admin-workspace-main" id="admin-content">{children}</main>
  </div>;
}

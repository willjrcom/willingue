import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { homeForRole } from "@/lib/role-path";
export default async function Home() {
  const user = await currentUser();
  redirect(homeForRole(user));
}

import { redirect } from "next/navigation";
import { roleHome } from "@/features/auth/constants";
import { requireUser } from "@/features/auth/session";

export default async function DashboardRedirect() {
  const user = await requireUser();
  redirect(roleHome[user.role]);
}

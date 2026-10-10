import { requireUser } from "@/features/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser("admin");
  return children;
}

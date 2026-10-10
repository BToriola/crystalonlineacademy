import { requireUser } from "@/features/auth/session";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireUser("parent");
  return children;
}

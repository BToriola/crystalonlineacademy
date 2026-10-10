import { requireUser } from "@/features/auth/session";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  await requireUser("student");
  return children;
}

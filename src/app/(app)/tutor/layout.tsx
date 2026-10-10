import { requireUser } from "@/features/auth/session";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  await requireUser("tutor", "admin");
  return children;
}

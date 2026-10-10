import type { Role } from "@/types/database";

export const DEMO_ROLE_COOKIE = "coa_demo_role";

export const roleHome: Record<Role, string> = {
  admin: "/admin",
  tutor: "/tutor",
  parent: "/parent",
  student: "/learner",
};

export const roleLabel: Record<Role, string> = {
  admin: "Admin",
  tutor: "Tutor",
  parent: "Parent",
  student: "Learner",
};

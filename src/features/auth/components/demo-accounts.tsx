import { SparklesIcon } from "lucide-react";
import { signInAsDemo } from "@/features/auth/actions";
import type { Role } from "@/types/database";
import { DemoRoleButton } from "./demo-role-button";

const demoRoles: { role: Role; label: string; name: string; description: string; avatarSeed: string; tone: string }[] = [
  { role: "admin", label: "Admin & tutor", name: "Crystal", description: "Runs the academy, still teaches", avatarSeed: "Crystal Adeyemi", tone: "bg-coral" },
  { role: "tutor", label: "Tutor", name: "Mr. Tobi", description: "Maths & 11+ · Lagos", avatarSeed: "Mr. Tobi", tone: "bg-primary" },
  { role: "parent", label: "Parent", name: "Amara", description: "Mum of two · London", avatarSeed: "Amara Okafor", tone: "bg-sun" },
  { role: "student", label: "Learner", name: "Maya", description: "Year 7 · stars & badges", avatarSeed: "maya", tone: "bg-leaf" },
];

export function DemoAccounts() {
  return (
    <section aria-labelledby="demo-heading" className="relative overflow-hidden rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <SparklesIcon className="size-4" aria-hidden />
        </span>
        <div>
          <h2 id="demo-heading" className="font-display text-lg leading-tight font-extrabold">
            Explore the demo
          </h2>
          <p className="text-xs text-muted-foreground">One click, no password. Pick a role to look around.</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {demoRoles.map((d) => (
          <li key={d.role}>
            <form action={signInAsDemo.bind(null, d.role)} className="h-full">
              <DemoRoleButton label={d.label} name={d.name} description={d.description} avatarSeed={d.avatarSeed} tone={d.tone} />
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}

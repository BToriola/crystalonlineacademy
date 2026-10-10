import type { Metadata } from "next";
import { BellIcon, GraduationCapIcon, KeyRoundIcon, PaletteIcon, UserRoundIcon, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { roleLabel } from "@/features/auth/constants";
import { requireUser } from "@/features/auth/session";
import { AppearanceCard } from "@/features/settings/components/appearance-card";
import { NotificationsCard } from "@/features/settings/components/notifications-card";
import { PasswordForm } from "@/features/settings/components/password-form";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { TutorProfileForm } from "@/features/settings/components/tutor-profile-form";
import { getTutor } from "@/features/tutors/queries";
import { isDemoMode } from "@/lib/env";

export const metadata: Metadata = { title: "Settings" };

function Section({ id, icon: Icon, title, description, children }: { id: string; icon: LucideIcon; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const teaches = user.role === "tutor" || user.role === "admin";
  const tutor = teaches ? await getTutor(user.id) : null;
  const wantsEmail = user.role !== "student";

  const sections = [
    { id: "profile", label: "Profile", icon: UserRoundIcon },
    { id: "appearance", label: "Appearance", icon: PaletteIcon },
    wantsEmail && { id: "notifications", label: "Notifications", icon: BellIcon },
    tutor && { id: "tutor-profile", label: "Public tutor profile", icon: GraduationCapIcon },
    { id: "password", label: "Password", icon: KeyRoundIcon },
  ].filter(Boolean) as { id: string; label: string; icon: LucideIcon }[];

  return (
    <>
      <PageHeader eyebrow="Settings" title="Make it yours" description="Your details, how the app looks and how we keep in touch." />

      <div className="grid gap-8 *:min-w-0 lg:grid-cols-[14rem_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-4 hidden items-center gap-3 rounded-2xl border bg-card p-3 lg:flex">
            <UserAvatar name={user.full_name} src={user.avatar_url} seed={user.id} className="size-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[user.role]}</p>
            </div>
          </div>
          <nav aria-label="Settings sections">
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
              {sections.map((s) => (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:rounded-xl lg:border-0 lg:py-2"
                  >
                    <s.icon className="size-4" /> {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <Section id="profile" icon={UserRoundIcon} title="Profile" description="How you appear to the academy, tutors and families.">
            <ProfileForm
              email={user.email}
              initial={{ full_name: user.full_name, phone: user.phone ?? "", timezone: user.timezone, country: user.country }}
            />
          </Section>

          <Section id="appearance" icon={PaletteIcon} title="Appearance" description="Pick a colour theme and light or dark mode. Saved on this device.">
            <AppearanceCard />
          </Section>

          {wantsEmail && (
            <Section id="notifications" icon={BellIcon} title="Notifications" description="Choose what we email you about.">
              <NotificationsCard role={user.role} />
            </Section>
          )}

          {tutor && (
            <Section
              id="tutor-profile"
              icon={GraduationCapIcon}
              title="Public tutor profile"
              description={tutor.tutor.is_published ? "Shown on the Meet our tutors page." : "Not published yet — the academy team publishes profiles once they're ready."}
            >
              <TutorProfileForm
                initial={{
                  headline: tutor.tutor.headline ?? "",
                  bio: tutor.tutor.bio ?? "",
                  subjects: tutor.tutor.subjects,
                  levels: tutor.tutor.levels,
                  qualification: tutor.tutor.qualification ?? "",
                  languages: tutor.tutor.languages,
                }}
              />
            </Section>
          )}

          <Section id="password" icon={KeyRoundIcon} title="Password" description="Use at least 8 characters — a short phrase is easier to remember.">
            <PasswordForm live={!isDemoMode} />
          </Section>
        </div>
      </div>
    </>
  );
}

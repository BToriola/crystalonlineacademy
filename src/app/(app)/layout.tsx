import { Suspense } from "react";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { JoinNotice } from "@/components/layout/join-notice";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireUser } from "@/features/auth/session";
import { isDemoMode } from "@/lib/env";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar user={{ name: user.full_name, email: user.email, role: user.role, avatarUrl: user.avatar_url }} />
      <SidebarInset className="min-w-0">
        <Suspense>
          <JoinNotice />
        </Suspense>
        <AppTopbar role={user.role} timezone={user.timezone} demo={isDemoMode} />
        <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

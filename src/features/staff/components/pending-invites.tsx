"use client";

import { useTransition } from "react";
import { MailIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { relativeTime } from "@/lib/format";
import { revokeInvite } from "../actions";
import type { StaffInvite } from "../queries";
import { CopySignupLink } from "./invite-staff-dialog";

export function PendingInvites({ invites }: { invites: StaffInvite[] }) {
  const [pending, startTransition] = useTransition();
  if (!invites.length) return null;

  return (
    <Card className="gap-3 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold">Waiting to sign up</h2>
          <p className="text-sm text-muted-foreground">Send them the sign-up link and ask them to use this email.</p>
        </div>
        <CopySignupLink />
      </div>
      <ul className="divide-y">
        {invites.map((invite) => (
          <li key={invite.email} className="flex items-center gap-3 py-2.5 text-sm">
            <MailIcon className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-medium">{invite.email}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{invite.role}</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">{relativeTime(invite.created_at)}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove invite for ${invite.email}`}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await revokeInvite(invite.email);
                  if (result.ok) toast.success(result.message);
                  else toast.error(result.error);
                })
              }
            >
              <XIcon />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

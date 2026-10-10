"use client";

import { useState, useTransition } from "react";
import { CopyIcon, Loader2Icon, SendIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteStaff } from "../actions";

export function InviteStaffDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"tutor" | "admin">("tutor");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await inviteStaff({ email, role });
      if (!result.ok) return void toast.error(result.error);
      toast.success("Invite created", { description: result.message });
      setOpen(false);
      setEmail("");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <UserPlusIcon data-icon="inline-start" />
          Invite to team
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Invite a tutor or admin</DialogTitle>
            <DialogDescription>
              They sign up at <strong>/signup</strong> with this exact email and get the right access automatically. If they already
              have an account, they&apos;re upgraded straight away.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <Input id="invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-role">Role</FieldLabel>
            <Select value={role} onValueChange={(v) => setRole(v as "tutor" | "admin")}>
              <SelectTrigger id="invite-role" className="h-11! w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutor">Tutor</SelectItem>
                <SelectItem value="admin">Admin (can also teach)</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>New tutors start unpublished. You choose when they appear on the website.</FieldDescription>
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="rounded-full">
              {pending ? <Loader2Icon className="animate-spin" /> : <SendIcon data-icon="inline-start" />}
              Create invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CopySignupLink() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={() => {
        navigator.clipboard.writeText(`${window.location.origin}/signup`);
        toast.success("Sign-up link copied");
      }}
    >
      <CopyIcon data-icon="inline-start" />
      Copy sign-up link
    </Button>
  );
}

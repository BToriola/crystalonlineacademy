import type { Metadata } from "next";
import { HeartHandshakeIcon, MessageCircleIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { roleLabel } from "@/features/auth/constants";
import { requireUser } from "@/features/auth/session";
import { MessagesApp, type ConversationSummary } from "@/features/messaging/components/messages-app";
import { listConversations, listMessages } from "@/features/messaging/queries";
import { getProfilesByIds } from "@/features/profiles/queries";
import { getStudentsForParent, getStudentsForTutor, listStudents } from "@/features/students/queries";
import { isDemoMode } from "@/lib/env";
import { shortZone } from "@/lib/format";
import type { Student } from "@/types/database";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await requireUser();
  const { c } = await searchParams;

  if (user.role === "student") {
    return (
      <>
        <PageHeader eyebrow="Messages" title="Messages" />
        <EmptyState
          icon={HeartHandshakeIcon}
          title="Messages are for grown-ups"
          description="Your tutor chats with your parent or carer here. If you've got a question, ask it in your next lesson — tutors love questions!"
        />
      </>
    );
  }

  const conversations = await listConversations(user.id);
  const isParent = user.role === "parent";
  const [messages, profiles, students] = await Promise.all([
    listMessages(conversations.map((x) => x.id)),
    getProfilesByIds(conversations.map((x) => (isParent ? x.tutor_id : x.parent_id))),
    (async (): Promise<Student[]> => {
      if (isParent) return getStudentsForParent(user.id);
      const own = await getStudentsForTutor(user.id);
      const missing = conversations.some((x) => x.student_id && !own.some((s) => s.id === x.student_id));
      return missing && user.role === "admin" ? listStudents() : own;
    })(),
  ]);

  const studentById = new Map(students.map((s) => [s.id, s]));
  const summaries: ConversationSummary[] = conversations.map((x) => {
    const otherId = isParent ? x.tutor_id : x.parent_id;
    const other = profiles[otherId];
    const student = x.student_id ? studentById.get(x.student_id) : undefined;
    return {
      id: x.id,
      otherName: other?.full_name ?? (isParent ? "Your tutor" : "Parent"),
      otherSeed: otherId,
      otherAvatarUrl: other?.avatar_url ?? null,
      otherRoleLabel: other ? `${other.role === "admin" ? "Tutor & founder" : roleLabel[other.role]} · ${shortZone(other.timezone)}` : "",
      studentName: student?.first_name ?? null,
      lastMessageAt: x.last_message_at,
    };
  });

  const activeId = summaries.some((x) => x.id === c) ? (c as string) : null;

  return (
    <>
      <PageHeader
        eyebrow="Messages"
        title="Messages"
        description={
          isParent
            ? "Chat with your child's tutors — they usually reply within a day."
            : "Keep families in the loop. Times are shown in your time zone."
        }
      />
      {summaries.length ? (
        <MessagesApp
          key={user.id}
          userId={user.id}
          timezone={user.timezone}
          conversations={summaries}
          initialMessages={messages}
          activeId={activeId}
          live={!isDemoMode}
        />
      ) : (
        <EmptyState
          icon={MessageCircleIcon}
          title="No conversations yet"
          description={
            isParent
              ? "Once your child is matched with a tutor, you can message them here."
              : "Conversations with families appear here once you're matched with a student."
          }
        />
      )}
    </>
  );
}

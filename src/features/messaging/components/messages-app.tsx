"use client";

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeftIcon, Loader2Icon, MessageCircleIcon, SendHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { markConversationRead, sendMessage } from "@/features/messaging/actions";
import { formatInZone } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/database";

export type ConversationSummary = {
  id: string;
  otherName: string;
  otherSeed: string;
  otherAvatarUrl: string | null;
  otherRoleLabel: string;
  studentName: string | null;
  lastMessageAt: string;
};

type Props = {
  userId: string;
  timezone: string;
  conversations: ConversationSummary[];
  initialMessages: Message[];
  activeId: string | null;
  live: boolean;
};

type ThreadMessage = Message & { pending?: boolean };

const dayKey = (iso: string, tz: string) => formatInZone(iso, tz, "yyyy-MM-dd");

function dayLabel(iso: string, tz: string) {
  const key = dayKey(iso, tz);
  const now = Date.now();
  if (key === dayKey(new Date(now).toISOString(), tz)) return "Today";
  if (key === dayKey(new Date(now - 86_400_000).toISOString(), tz)) return "Yesterday";
  return formatInZone(iso, tz, "EEEE d MMMM");
}

function listTime(iso: string, tz: string) {
  const label = dayLabel(iso, tz);
  if (label === "Today") return formatInZone(iso, tz, "HH:mm");
  if (label === "Yesterday") return "Yesterday";
  return formatInZone(iso, tz, "d MMM");
}

function mergeMessages(...lists: Message[][]) {
  const map = new Map<string, Message>();
  for (const list of lists) for (const m of list) map.set(m.id, m);
  return [...map.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function MessagesApp({ userId, timezone, conversations, initialMessages, activeId, live }: Props) {
  const [received, setReceived] = useState<Message[]>([]);
  const [readLocally, setReadLocally] = useState<Set<string>>(() => new Set(activeId ? [activeId] : []));
  const messages = useMemo(() => mergeMessages(initialMessages, received), [initialMessages, received]);
  const [optimistic, addOptimistic] = useOptimistic<ThreadMessage[], ThreadMessage>(messages, (state, m) => [...state, m]);
  const [draft, setDraft] = useState("");
  const [sending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const explicit = !!active;
  const thread = active ? optimistic.filter((m) => m.conversation_id === active.id) : [];

  const sorted = useMemo(() => {
    const last = new Map<string, string>();
    for (const m of messages) last.set(m.conversation_id, m.created_at);
    return conversations
      .map((c) => ({ ...c, lastMessageAt: last.get(c.id) ?? c.lastMessageAt, preview: messages.findLast((m) => m.conversation_id === c.id) }))
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  }, [conversations, messages]);

  const unreadFor = (id: string) =>
    readLocally.has(id) || id === active?.id ? 0 : messages.filter((m) => m.conversation_id === id && m.sender_id !== userId && !m.read_at).length;

  if (active && !readLocally.has(active.id)) setReadLocally((s) => new Set(s).add(active.id));

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.id, thread.length]);

  useEffect(() => {
    if (!live || !active) return;
    void markConversationRead(active.id);
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${active.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active.id}` },
        (payload) => {
          const incoming = payload.new as Message;
          setReceived((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [live, active]);

  function send() {
    const body = draft.trim();
    if (!active || !body || sending) return;
    setDraft("");
    startTransition(async () => {
      addOptimistic({
        id: `optimistic-${Date.now()}`,
        conversation_id: active.id,
        sender_id: userId,
        body,
        read_at: null,
        created_at: new Date().toISOString(),
        pending: true,
      });
      const result = await sendMessage({ conversationId: active.id, body });
      if (result.ok && result.data) {
        const sent = result.data;
        setReceived((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      } else {
        toast.error(result.ok ? "Message not sent — please try again." : result.error);
        setDraft(body);
      }
    });
    inputRef.current?.focus();
  }

  return (
    <div className="grid h-[calc(100svh-13rem)] min-h-[28rem] overflow-hidden rounded-3xl border bg-card md:grid-cols-[17rem_1fr] lg:grid-cols-[20rem_1fr]">
      {/* Conversation list */}
      <nav aria-label="Conversations" className={cn("min-h-0 flex-col border-r", explicit ? "hidden md:flex" : "flex")}>
        <p className="border-b px-4 py-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">Conversations</p>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {sorted.map((c) => {
            const unread = unreadFor(c.id);
            const selected = c.id === active?.id;
            return (
              <li key={c.id}>
                <Link
                  href={`/messages?c=${c.id}`}
                  scroll={false}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    selected && "bg-primary/8 hover:bg-primary/12",
                  )}
                >
                  <UserAvatar name={c.otherName} src={c.otherAvatarUrl} seed={c.otherSeed} className="size-11" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-sm", unread ? "font-bold" : "font-medium")}>{c.otherName}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground" suppressHydrationWarning>
                        {listTime(c.lastMessageAt, timezone)}
                      </span>
                    </span>
                    {c.studentName && <span className="block truncate text-xs text-primary">About {c.studentName}</span>}
                    <span className="flex items-center gap-2">
                      <span className={cn("min-w-0 flex-1 truncate text-xs", unread ? "text-foreground" : "text-muted-foreground")}>
                        {c.preview ? `${c.preview.sender_id === userId ? "You: " : ""}${c.preview.body}` : "No messages yet"}
                      </span>
                      {unread > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1.5 text-[11px] font-semibold text-white" aria-label={`${unread} unread`}>
                          {unread}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Thread */}
      <section aria-label={active ? `Conversation with ${active.otherName}` : "Conversation"} className={cn("min-h-0 min-w-0 flex-col", explicit ? "flex" : "hidden md:flex")}>
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b px-3 py-2.5 sm:px-4">
              <Button asChild variant="ghost" size="icon" className="rounded-full md:hidden">
                <Link href="/messages" aria-label="Back to conversations">
                  <ArrowLeftIcon />
                </Link>
              </Button>
              <UserAvatar name={active.otherName} src={active.otherAvatarUrl} seed={active.otherSeed} className="size-10" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{active.otherName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {active.otherRoleLabel}
                  {active.studentName && ` · about ${active.studentName}`}
                </p>
              </div>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-3 py-4 sm:px-5" aria-live="polite">
              {thread.length === 0 && (
                <p className="mx-auto mt-10 max-w-xs text-center text-sm text-muted-foreground">
                  Say hello! Messages here are private between you and {active.otherName}.
                </p>
              )}
              <ol className="space-y-1.5">
                {thread.map((m, i) => {
                  const mine = m.sender_id === userId;
                  const showDay = i === 0 || dayKey(m.created_at, timezone) !== dayKey(thread[i - 1].created_at, timezone);
                  return (
                    <li key={m.id}>
                      {showDay && (
                        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground" role="separator" aria-label={dayLabel(m.created_at, timezone)}>
                          <span className="h-px flex-1 bg-border" />
                          <span suppressHydrationWarning>{dayLabel(m.created_at, timezone)}</span>
                          <span className="h-px flex-1 bg-border" />
                        </div>
                      )}
                      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%]",
                            mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border bg-card",
                            m.pending && "opacity-70",
                          )}
                        >
                          <p className="break-words whitespace-pre-wrap">{m.body}</p>
                          <p className={cn("mt-1 text-right text-[11px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {m.pending ? "Sending…" : formatInZone(m.created_at, timezone, "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <form
              className="flex items-end gap-2 border-t p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <label htmlFor="composer" className="sr-only">
                Message {active.otherName}
              </label>
              <textarea
                id="composer"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Write a message…"
                className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-3xl border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" size="icon-lg" className="size-11 shrink-0 rounded-full" disabled={!draft.trim()} aria-label="Send message">
                {sending ? <Loader2Icon className="animate-spin" /> : <SendHorizontalIcon />}
              </Button>
            </form>
            <p className="hidden px-4 pb-2 text-[11px] text-muted-foreground sm:block">Enter to send · Shift + Enter for a new line</p>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center text-muted-foreground">
            <div className="space-y-2">
              <MessageCircleIcon className="mx-auto size-8" />
              <p>Pick a conversation to start chatting.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

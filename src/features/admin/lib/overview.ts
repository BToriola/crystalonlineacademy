import { format, subDays } from "date-fns";
import type { Invoice, Lead, Session, TutorApplication, Assignment } from "@/types/database";
import { dayRange, inRange, monthRange, nowInZone, weekRange } from "./time";

export type WeeklySessionsPoint = { week: string; completed: number; scheduled: number; missed: number };

export function sessionsPerWeek(sessions: Session[], timezone: string, weeksBack = 6, weeksAhead = 1) {
  const points: WeeklySessionsPoint[] = [];
  for (let offset = -weeksBack; offset <= weeksAhead; offset++) {
    const { from, to } = weekRange(timezone, offset);
    const inWeek = sessions.filter((s) => inRange(s.starts_at, from, to));
    points.push({
      week: format(nowInZone(timezone, from.getTime()), "d MMM"),
      completed: inWeek.filter((s) => s.status === "completed").length,
      scheduled: inWeek.filter((s) => s.status === "scheduled").length,
      missed: inWeek.filter((s) => s.status === "missed" || s.status === "cancelled").length,
    });
  }
  return points;
}

export function chartWindow(timezone: string, weeksBack = 6, weeksAhead = 1) {
  return {
    from: weekRange(timezone, -weeksBack).from,
    to: weekRange(timezone, weeksAhead).to,
  };
}

export function revenueThisMonth(invoices: Invoice[], timezone: string) {
  const { from, to } = monthRange(timezone);
  const paid = invoices.filter((i) => i.status === "paid" && i.paid_on && inRange(`${i.paid_on}T12:00:00Z`, from, to));
  return {
    GBP: paid.filter((i) => i.currency === "GBP").reduce((s, i) => s + Number(i.amount), 0),
    CAD: paid.filter((i) => i.currency === "CAD").reduce((s, i) => s + Number(i.amount), 0),
  };
}

export function outstandingInvoices(invoices: Invoice[]) {
  const open = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  return {
    count: open.length,
    overdue: open.filter((i) => i.status === "overdue").length,
    GBP: open.filter((i) => i.currency === "GBP").reduce((s, i) => s + Number(i.amount), 0),
    CAD: open.filter((i) => i.currency === "CAD").reduce((s, i) => s + Number(i.amount), 0),
  };
}

export function activeCounts(assignments: Assignment[]) {
  const active = assignments.filter((a) => a.status === "active");
  return {
    students: new Set(active.map((a) => a.student_id)).size,
    tutors: new Set(active.map((a) => a.tutor_id)).size,
  };
}

export function thisWeekSessions(sessions: Session[], timezone: string) {
  const { from, to } = weekRange(timezone);
  return sessions.filter((s) => inRange(s.starts_at, from, to) && s.status !== "cancelled");
}

export function todaysSessions(sessions: Session[], timezone: string) {
  const { from, to } = dayRange(timezone);
  return sessions.filter((s) => inRange(s.starts_at, from, to)).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export type AttentionItem = {
  key: string;
  label: string;
  detail: string;
  href: string;
  count: number;
  tone: "primary" | "coral" | "sun" | "destructive";
};

export function needsAttention({
  leads,
  applications,
  invoices,
  sessions,
}: {
  leads: Lead[];
  applications: TutorApplication[];
  invoices: Invoice[];
  sessions: Session[];
}): AttentionItem[] {
  const fortnightAgo = subDays(new Date(), 14).getTime();
  const recent = sessions.filter((s) => new Date(s.starts_at).getTime() >= fortnightAgo);
  const newLeads = leads.filter((l) => l.status === "new").length;
  const awaiting = applications.filter((a) => a.status === "new" || a.status === "screening").length;
  const overdue = invoices.filter((i) => i.status === "overdue").length;
  const missed = recent.filter((s) => s.status === "missed").length;
  const lowRated = recent.filter((s) => s.parent_rating !== null && s.parent_rating <= 3).length;

  const items: AttentionItem[] = [
    { key: "leads", label: "New trial requests", detail: "Reply within a day to keep families warm", href: "/admin/leads", count: newLeads, tone: "primary" },
    { key: "applications", label: "Applications to review", detail: "New and in screening", href: "/admin/applications", count: awaiting, tone: "sun" },
    { key: "overdue", label: "Overdue invoices", detail: "Send a friendly reminder", href: "/admin/invoices?status=overdue", count: overdue, tone: "destructive" },
    { key: "missed", label: "Missed sessions", detail: "In the last 14 days — offer a catch-up", href: "/admin/sessions?status=missed&range=past", count: missed, tone: "coral" },
    { key: "low-rated", label: "Low-rated sessions", detail: "Parent rating of 3 stars or fewer", href: "/admin/sessions?range=past&rating=low", count: lowRated, tone: "coral" },
  ];
  return items.filter((i) => i.count > 0);
}

export function leadFunnel(leads: Lead[]) {
  const stages = [
    { status: "new", label: "New" },
    { status: "contacted", label: "Contacted" },
    { status: "trial_booked", label: "Trial booked" },
    { status: "converted", label: "Converted" },
  ] as const;
  // Each stage counts leads that reached it or went further, so the funnel narrows naturally.
  const order: Lead["status"][] = ["new", "contacted", "trial_booked", "converted"];
  const reached = (status: Lead["status"]) =>
    leads.filter((l) => l.status !== "closed" && order.indexOf(l.status) >= order.indexOf(status)).length;
  return {
    stages: stages.map((s) => ({ ...s, count: reached(s.status), current: leads.filter((l) => l.status === s.status).length })),
    closed: leads.filter((l) => l.status === "closed").length,
    total: leads.length,
  };
}


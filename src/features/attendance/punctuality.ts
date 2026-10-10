import "server-only";
import { listSessions } from "@/features/sessions/queries";
import { listAttendance, summariseAttendance } from "./queries";

export type Punctuality = { total: number; onTime: number; late: number; noShow: number };

export async function punctualityByTutor(days = 30): Promise<Map<string, Punctuality>> {
  const now = Date.now();
  const sessions = (await listSessions({ from: new Date(now - days * 86_400_000), to: new Date(now) })).filter(
    (s) => s.status !== "cancelled",
  );
  const attendance = await listAttendance(sessions.map((s) => s.id));
  const result = new Map<string, Punctuality>();

  for (const session of sessions) {
    const { flags } = summariseAttendance(session, attendance, now);
    const stats = result.get(session.tutor_id) ?? { total: 0, onTime: 0, late: 0, noShow: 0 };
    stats.total += 1;
    if (flags.includes("tutor_no_show")) stats.noShow += 1;
    else if (flags.includes("tutor_late")) stats.late += 1;
    else stats.onTime += 1;
    result.set(session.tutor_id, stats);
  }
  return result;
}

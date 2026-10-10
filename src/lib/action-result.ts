export type ActionResult<T = undefined> = { ok: true; message?: string; data?: T } | { ok: false; error: string };

export const demoResult = (message = "Saved (demo mode — nothing was stored).") => ({ ok: true as const, message });

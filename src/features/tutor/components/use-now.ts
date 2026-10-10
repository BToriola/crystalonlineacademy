"use client";

import { useSyncExternalStore } from "react";

const subscribers = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  subscribers.add(cb);
  timer ??= setInterval(() => subscribers.forEach((s) => s()), 1000);
  return () => {
    subscribers.delete(cb);
    if (!subscribers.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const snapshot = () => Math.floor(Date.now() / 1000) * 1000;

/** Current time (ms), ticking each second on the client; null during SSR so markup stays deterministic. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { BRAND_THEME_STORAGE_KEY, type BrandTheme } from "./brand-themes";

const listeners = new Set<() => void>();

function read(): BrandTheme {
  if (typeof document === "undefined") return "crystal";
  return (document.documentElement.dataset.theme as BrandTheme | undefined) ?? "crystal";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBrandTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "crystal" as BrandTheme);

  const setTheme = useCallback((next: BrandTheme) => {
    if (next === "crystal") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(BRAND_THEME_STORAGE_KEY, next);
    } catch {}
    listeners.forEach((l) => l());
  }, []);

  return { theme, setTheme };
}

"use client";

import { useSyncExternalStore } from "react";

export type CompareItem = { slug: string; name: string };

const KEY = "eo-compare";
export const COMPARE_MAX = 3;
const listeners = new Set<() => void>();
let cache: CompareItem[] | null = null;
const EMPTY: CompareItem[] = [];

function read(): CompareItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((i) => typeof i?.slug === "string").slice(0, COMPARE_MAX) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: CompareItem[]) {
  cache = items;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private mode: keep the in-memory list only.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCompare() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    items,
    has: (slug: string) => items.some((i) => i.slug === slug),
    full: items.length >= COMPARE_MAX,
    toggle: (item: CompareItem) => {
      const current = read();
      if (current.some((i) => i.slug === item.slug)) write(current.filter((i) => i.slug !== item.slug));
      else if (current.length < COMPARE_MAX) write([...current, item]);
    },
    remove: (slug: string) => write(read().filter((i) => i.slug !== slug)),
    clear: () => write([]),
  };
}

"use client";

import { useSyncExternalStore } from "react";
import { createBrowserSupabase } from "./supabase/browser";

type State = { status: "loading" | "guest" | "ready"; ids: Set<string> };

const listeners = new Set<() => void>();
let state: State = { status: "loading", ids: new Set() };
let started = false;
const SERVER_STATE: State = { status: "loading", ids: new Set() };

function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

async function load() {
  const supabase = createBrowserSupabase();
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return set({ status: "guest", ids: new Set() });
  const { data } = await supabase.from("eo_favorites").select("eo_id");
  set({ status: "ready", ids: new Set((data ?? []).map((r) => r.eo_id as string)) });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    load();
    createBrowserSupabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
    });
  }
  return () => listeners.delete(listener);
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
  return {
    status: snapshot.status,
    isFavorite: (id: string) => snapshot.ids.has(id),
    /** Returns false when the visitor must sign in first. */
    toggle: async (id: string): Promise<boolean> => {
      if (state.status !== "ready") return false;
      const supabase = createBrowserSupabase();
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) return false;
      const ids = new Set(state.ids);
      const adding = !ids.has(id);
      if (adding) ids.add(id);
      else ids.delete(id);
      set({ status: "ready", ids });
      const { error } = adding
        ? await supabase.from("eo_favorites").insert({ user_id: userId, eo_id: id })
        : await supabase.from("eo_favorites").delete().eq("user_id", userId).eq("eo_id", id);
      if (error) {
        const rollback = new Set(state.ids);
        if (adding) rollback.delete(id);
        else rollback.add(id);
        set({ status: "ready", ids: rollback });
      }
      return true;
    },
  };
}

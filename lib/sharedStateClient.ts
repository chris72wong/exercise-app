"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeSharedState,
  SHARED_STATE_ID,
  type SharedAppState,
  type SharedAppStatePatch,
} from "@/lib/sharedState";

let browserClient: SupabaseClient | null = null;

function getBrowserSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

export async function loadSharedState(): Promise<SharedAppState | null> {
  const response = await fetch("/api/shared-state", {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { state?: unknown };
  return normalizeSharedState(payload.state);
}

export async function saveSharedStatePatch(patch: SharedAppStatePatch): Promise<void> {
  const response = await fetch("/api/shared-state", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    throw new Error("Unable to save shared state.");
  }
}

export function subscribeToSharedState(
  onStateChange: (state: SharedAppState) => void
): () => void {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return () => {};
  }

  const channel = supabase
    .channel("global-app-state")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "app_state",
        filter: `id=eq.${SHARED_STATE_ID}`,
      },
      (payload) => {
        const nextValue = (payload.new as { value?: unknown } | null)?.value;
        if (nextValue) {
          onStateChange(normalizeSharedState(nextValue));
        }
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeSharedState,
  SHARED_STATE_ID,
  type SharedAppState,
  type SharedAppStatePatch,
} from "@/lib/sharedState";

const SHARED_STATE_STORAGE_KEY = "gymPartnerSharedState:v1";
const SHARED_STATE_LOCAL_EVENT = "gymPartnerSharedState:local-update";

let browserClient: SupabaseClient | null = null;

function readLocalSharedState(): SharedAppState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(SHARED_STATE_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return normalizeSharedState(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

function writeLocalSharedState(state: SharedAppState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SHARED_STATE_STORAGE_KEY, JSON.stringify(state));
}

function emitLocalSharedState(state: SharedAppState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<SharedAppState>(SHARED_STATE_LOCAL_EVENT, { detail: state })
  );
}

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
  const localState = readLocalSharedState();

  try {
    const response = await fetch("/api/shared-state", {
      cache: "no-store",
    });

    if (!response.ok) {
      return localState;
    }

    const payload = (await response.json()) as { state?: unknown; configured?: boolean };
    const remoteState = payload.state ? normalizeSharedState(payload.state) : null;

    if (payload.configured === false) {
      return localState ?? remoteState;
    }

    if (remoteState) {
      writeLocalSharedState(remoteState);
      return remoteState;
    }

    return localState;
  } catch {
    return localState;
  }
}

export async function saveSharedStatePatch(patch: SharedAppStatePatch): Promise<void> {
  const currentLocalState = readLocalSharedState() ?? normalizeSharedState(null);
  const nextLocalState = normalizeSharedState({
    ...currentLocalState,
    ...patch,
  });

  writeLocalSharedState(nextLocalState);
  emitLocalSharedState(nextLocalState);

  try {
    const response = await fetch("/api/shared-state", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    });

    if (!response.ok) {
      if (response.status === 503) {
        return;
      }

      throw new Error("Unable to save shared state.");
    }

    const payload = (await response.json()) as { state?: unknown };
    if (payload.state) {
      const remoteState = normalizeSharedState(payload.state);
      writeLocalSharedState(remoteState);
      emitLocalSharedState(remoteState);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unable to save shared state.") {
      throw error;
    }
  }
}

export function subscribeToSharedState(
  onStateChange: (state: SharedAppState) => void
): () => void {
  const handleLocalState = (event: Event) => {
    const state = (event as CustomEvent<SharedAppState>).detail;
    if (state) {
      onStateChange(normalizeSharedState(state));
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== SHARED_STATE_STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      onStateChange(normalizeSharedState(JSON.parse(event.newValue)));
    } catch {
      // Ignore malformed storage writes from outside the app.
    }
  };

  window.addEventListener(SHARED_STATE_LOCAL_EVENT, handleLocalState);
  window.addEventListener("storage", handleStorage);

  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return () => {
      window.removeEventListener(SHARED_STATE_LOCAL_EVENT, handleLocalState);
      window.removeEventListener("storage", handleStorage);
    };
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
    window.removeEventListener(SHARED_STATE_LOCAL_EVENT, handleLocalState);
    window.removeEventListener("storage", handleStorage);
    void supabase.removeChannel(channel);
  };
}

"use client";

import { useEffect, useState } from "react";
import {
  subscribeToSharedStateSyncStatus,
  type SharedStateSyncStatus,
} from "@/lib/sharedStateClient";

type SharedStateStatusResponse = {
  configured?: boolean;
  error?: string;
};

export default function SyncStatusBanner() {
  const [syncStatus, setSyncStatus] = useState<SharedStateSyncStatus | null>(null);

  useEffect(() => {
    let active = true;

    const checkSyncStatus = async () => {
      try {
        const response = await fetch("/api/shared-state", {
          cache: "no-store",
        });
        const payload = (await response.json()) as SharedStateStatusResponse;

        if (!active) {
          return;
        }

        if (!response.ok) {
          setSyncStatus({
            status: "error",
            message: payload.error ?? "Cloud sync could not be checked.",
          });
          return;
        }

        setSyncStatus(
          payload.configured === false
            ? {
                status: "local-only",
                message:
                  "Cloud sync is not configured. Changes are only saved on this device.",
              }
            : { status: "synced" }
        );
      } catch {
        if (active) {
          setSyncStatus({
            status: "error",
            message: "Cloud sync could not be reached.",
          });
        }
      }
    };

    void checkSyncStatus();
    const unsubscribe = subscribeToSharedStateSyncStatus(setSyncStatus);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (!syncStatus || syncStatus.status === "synced") {
    return null;
  }

  return (
    <div className="border-b border-amber-400/30 bg-amber-500/15 px-4 py-2 text-center text-sm font-medium text-amber-100">
      {syncStatus.message}
    </div>
  );
}

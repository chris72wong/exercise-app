"use client";

import { useEffect, useState } from "react";

type WorkoutProgressWidgetProps = {
  title: string;
  progressPercent: number;
  variant?: "blue" | "red";
};

export default function WorkoutProgressWidget({
  title,
  progressPercent,
  variant = "blue",
}: WorkoutProgressWidgetProps) {
  const hasProgress = progressPercent > 0;
  const isRunning = progressPercent > 0 && progressPercent < 100;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const colorClass = variant === "red" ? "progress-red" : "progress-blue";

  useEffect(() => {
    if (!isRunning) {
      const reset = window.setTimeout(() => setElapsedSeconds(0), 0);
      return () => window.clearTimeout(reset);
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timerLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="rounded-3xl bg-neutral-900/80 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{title}</p>
        <p className="text-xs font-semibold tabular-nums text-neutral-400">{timerLabel}</p>
      </div>
      <div className="mt-6 w-full">
        <div
          className={`relative h-3 w-full overflow-visible rounded-full bg-neutral-800 ${colorClass} ${
            hasProgress ? "progress-track-glow" : ""
          }`}
        >
          <div
            className={`relative h-full rounded-full transition-all duration-300 ${
              hasProgress ? "progress-fill-glow" : ""
            }`}
            style={{ width: `${progressPercent}%` }}
          />
          <span
            className={`pointer-events-none absolute bottom-full mb-0.5 text-[11px] font-semibold tracking-wide transition-all ${
              hasProgress ? "progress-label-glow" : "text-neutral-500"
            }`}
            style={{
              left: `clamp(0%, calc(${progressPercent}% - 1.25rem), calc(100% - 2.5rem))`,
            }}
          >
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}

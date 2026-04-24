"use client";

type WorkoutProgressWidgetProps = {
  title: string;
  progressPercent: number;
};

export default function WorkoutProgressWidget({
  title,
  progressPercent,
}: WorkoutProgressWidgetProps) {
  const hasProgress = progressPercent > 0;

  return (
    <div className="mb-6 rounded-3xl bg-neutral-900/80 p-6 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{title}</p>
      <div className="mt-6 w-full">
        <div
          className={`relative h-3 w-full overflow-visible rounded-full bg-neutral-800 ${
            hasProgress ? "progress-track-glow" : ""
          }`}
        >
          <div
            className={`relative h-full rounded-full bg-emerald-400 transition-all duration-300 ${
              hasProgress ? "progress-fill-glow" : ""
            }`}
            style={{ width: `${progressPercent}%` }}
          />
          <span
            className={`pointer-events-none absolute bottom-full mb-0.5 text-[11px] font-semibold tracking-wide transition-all ${
              hasProgress ? "text-emerald-300 progress-label-glow" : "text-neutral-500"
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

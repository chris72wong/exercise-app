"use client";

import { useEffect, useState } from "react";
import type { WorkoutDay } from "@/lib/generateWorkout";
import WorkoutProgressWidget from "../_components/workout-progress-widget";

const WORKOUT_STORAGE_KEY = "workoutPlan:v1";
const WORKOUT_COMPLETED_STORAGE_KEY = "workoutCompletedExercises:v1";

const fullBodyExercisePool = [
  "Goblet Squats",
  "Push-Ups",
  "Bent-Over Dumbbell Rows",
  "Romanian Deadlifts",
  "Walking Lunges",
  "Overhead Press",
  "Plank Hold",
  "Glute Bridges",
  "Mountain Climbers",
  "Farmer Carries",
];

const initialFullBodyWorkout = fullBodyExercisePool.slice(0, 6);

const stretchChecklistItems = [
  "Standing Quad Stretch",
  "Standing Calf Stretch",
  "Seated Single-Leg Hamstring Stretch (Left)",
  "Seated Single-Leg Hamstring Stretch (Right)",
  "Single Knee-to-Chest Stretch (Left)",
  "Single Knee-to-Chest Stretch (Right)",
  "Seated Butterfly Stretch",
  "Supine Figure-Four Stretch (Left)",
  "Supine Figure-Four Stretch (Right)",
];

type StretchPose =
  | "standing-quad"
  | "standing-calf"
  | "hamstring"
  | "knee-to-chest"
  | "butterfly"
  | "figure-four";

type StretchReferenceIllustrationProps = {
  stretchName: string;
};

function pickRandomExercises(count: number): string[] {
  const shuffled = [...fullBodyExercisePool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getPercent(complete: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((complete / total) * 100);
}

function getStretchPose(stretchName: string): { pose: StretchPose; isRightSide: boolean } {
  const isRightSide = stretchName.includes("(Right)");

  if (stretchName.startsWith("Standing Quad")) {
    return { pose: "standing-quad", isRightSide };
  }

  if (stretchName.startsWith("Standing Calf")) {
    return { pose: "standing-calf", isRightSide };
  }

  if (stretchName.startsWith("Seated Single-Leg Hamstring")) {
    return { pose: "hamstring", isRightSide };
  }

  if (stretchName.startsWith("Single Knee-to-Chest")) {
    return { pose: "knee-to-chest", isRightSide };
  }

  if (stretchName.startsWith("Supine Figure-Four")) {
    return { pose: "figure-four", isRightSide };
  }

  return { pose: "butterfly", isRightSide };
}

function StretchReferenceIllustration({ stretchName }: StretchReferenceIllustrationProps) {
  const { pose, isRightSide } = getStretchPose(stretchName);
  const shouldMirror = isRightSide && pose !== "butterfly" && pose !== "standing-calf";

  return (
    <svg
      viewBox="0 0 360 220"
      className="h-52 w-full bg-neutral-950"
      role="img"
      aria-label={`${stretchName} demonstration`}
    >
      <rect width="360" height="220" fill="#0a0a0a" />
      <rect x="36" y="178" width="288" height="12" rx="6" fill="#155e75" opacity="0.38" />
      <g transform={shouldMirror ? "translate(360 0) scale(-1 1)" : undefined}>
        {pose === "standing-quad" && (
          <>
            <line x1="246" y1="54" x2="246" y2="168" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <circle cx="174" cy="50" r="19" fill="#f8d5b8" />
            <path d="M168 70 C158 91 159 114 172 132" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M172 132 L166 179" stroke="#f97316" strokeWidth="15" strokeLinecap="round" />
            <path d="M172 132 C199 141 207 153 192 174" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M169 82 C189 93 203 118 194 151" fill="none" stroke="#f8d5b8" strokeWidth="9" strokeLinecap="round" />
            <path d="M189 172 L204 170" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M158 181 L176 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M171 82 L244 82" stroke="#f8d5b8" strokeWidth="9" strokeLinecap="round" />
          </>
        )}

        {pose === "standing-calf" && (
          <>
            <line x1="270" y1="36" x2="270" y2="176" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <circle cx="174" cy="55" r="18" fill="#f8d5b8" />
            <path d="M167 74 C182 93 199 110 219 126" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M215 126 C197 145 188 160 184 180" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M215 126 C179 132 147 149 117 178" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M116 181 L143 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M179 181 L206 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M188 89 L269 84" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
            <path d="M198 101 L266 102" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
          </>
        )}

        {pose === "hamstring" && (
          <>
            <circle cx="161" cy="76" r="18" fill="#f8d5b8" />
            <path d="M156 95 C137 111 124 128 112 151" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M112 151 C82 160 60 168 42 180" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M113 151 C143 166 173 176 206 181" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M205 181 L226 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M39 181 L63 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M145 112 C120 130 93 147 55 170" fill="none" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
            <path d="M153 121 C128 139 100 154 60 174" fill="none" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
          </>
        )}

        {pose === "knee-to-chest" && (
          <>
            <circle cx="85" cy="130" r="17" fill="#f8d5b8" />
            <path d="M102 130 C134 130 156 137 178 151" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M178 151 C206 166 236 176 270 180" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M177 151 C182 124 196 107 220 99" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M220 99 C210 123 194 139 176 151" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M140 120 C165 111 188 105 218 98" fill="none" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
            <path d="M151 136 C172 123 192 112 220 100" fill="none" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
            <path d="M269 181 L291 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
          </>
        )}

        {pose === "butterfly" && (
          <>
            <circle cx="180" cy="72" r="18" fill="#f8d5b8" />
            <path d="M180 91 C176 113 176 132 180 151" fill="none" stroke="#fb923c" strokeWidth="15" strokeLinecap="round" />
            <path d="M178 150 C147 151 121 164 96 181" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M182 150 C213 151 239 164 264 181" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M116 181 C141 168 164 165 180 179" fill="none" stroke="#fb923c" strokeWidth="13" strokeLinecap="round" />
            <path d="M244 181 C219 168 196 165 180 179" fill="none" stroke="#fb923c" strokeWidth="13" strokeLinecap="round" />
            <path d="M161 111 L137 154" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
            <path d="M199 111 L223 154" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
            <path d="M170 181 L190 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
          </>
        )}

        {pose === "figure-four" && (
          <>
            <circle cx="85" cy="129" r="17" fill="#f8d5b8" />
            <path d="M102 130 C133 130 155 137 177 151" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M177 151 C197 164 225 173 258 181" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M177 151 C190 129 207 116 232 113" fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" />
            <path d="M232 113 C220 136 200 151 177 151" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <path d="M229 113 L254 125" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M256 181 L279 181" stroke="#2b1d15" strokeWidth="7" strokeLinecap="round" />
            <path d="M140 120 C165 117 195 115 231 113" fill="none" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
            <path d="M151 136 C174 130 199 124 230 114" fill="none" stroke="#f8d5b8" strokeWidth="8" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}


function calculateCurrentWorkoutProgress(): number {
  try {
    const storedWorkout = window.localStorage.getItem(WORKOUT_STORAGE_KEY);
    const storedCompleted = window.localStorage.getItem(WORKOUT_COMPLETED_STORAGE_KEY);
    if (!storedWorkout || !storedCompleted) {
      return 0;
    }

    const parsedWorkout = JSON.parse(storedWorkout) as WorkoutDay[];
    const parsedCompleted = JSON.parse(storedCompleted) as string[];
    if (!Array.isArray(parsedWorkout) || !Array.isArray(parsedCompleted)) {
      return 0;
    }

    const completedSet = new Set(parsedCompleted);
    for (const day of parsedWorkout) {
      if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
        continue;
      }

      const completedCount = day.exercises.filter((exercise) =>
        completedSet.has(`${day.day}-${exercise}`)
      ).length;
      const dayPercent = Math.round((completedCount / day.exercises.length) * 100);
      const isInProgress = dayPercent > 0 && dayPercent < 100;

      if (isInProgress) {
        return dayPercent;
      }
    }

    return 0;
  } catch {
    return 0;
  }
}

type CardProgressBarProps = {
  percent: number;
};

function CardProgressBar({ percent }: CardProgressBarProps) {
  const hasProgress = percent > 0;

  return (
    <div className="mt-3 w-full">
      <div
        className={`relative h-3 w-full overflow-visible rounded-full bg-neutral-800 ${
          hasProgress ? "progress-track-glow" : ""
        }`}
      >
        <div
          className={`relative h-full rounded-full bg-emerald-400 transition-all duration-300 ${
            hasProgress ? "progress-fill-glow" : ""
          }`}
          style={{ width: `${percent}%` }}
        />

        <span
          className={`pointer-events-none absolute bottom-full mb-0.5 text-[11px] font-semibold tracking-wide transition-all ${
            hasProgress ? "text-emerald-300 progress-label-glow" : "text-neutral-500"
          }`}
          style={{
            left: `clamp(0%, calc(${percent}% - 1.25rem), calc(100% - 2.5rem))`,
          }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function HelpToolsPage() {
  const [currentWorkoutProgressPercent, setCurrentWorkoutProgressPercent] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    return calculateCurrentWorkoutProgress();
  });
  const [generatedWorkout, setGeneratedWorkout] = useState<string[]>(initialFullBodyWorkout);
  const [completedWorkout, setCompletedWorkout] = useState<Set<string>>(new Set());
  const [completedStretches, setCompletedStretches] = useState<Set<string>>(new Set());
  const [expandedStretch, setExpandedStretch] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCurrentWorkoutProgressPercent(calculateCurrentWorkoutProgress());
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  const workoutProgressPercent = getPercent(completedWorkout.size, generatedWorkout.length);
  const stretchProgressPercent = getPercent(completedStretches.size, stretchChecklistItems.length);

  const toggleWorkoutExercise = (exercise: string) => {
    setCompletedWorkout((current) => {
      const next = new Set(current);
      if (next.has(exercise)) {
        next.delete(exercise);
      } else {
        next.add(exercise);
      }
      return next;
    });
  };

  const toggleStretch = (stretch: string) => {
    setCompletedStretches((current) => {
      const next = new Set(current);
      if (next.has(stretch)) {
        next.delete(stretch);
      } else {
        next.add(stretch);
      }
      return next;
    });
  };

  const toggleWorkoutCard = () => {
    if (completedWorkout.size === generatedWorkout.length) {
      setCompletedWorkout(new Set());
      return;
    }

    setCompletedWorkout(new Set(generatedWorkout));
  };

  const toggleStretchCard = () => {
    if (completedStretches.size === stretchChecklistItems.length) {
      setCompletedStretches(new Set());
      return;
    }

    setCompletedStretches(new Set(stretchChecklistItems));
  };

  const handleGenerateWorkout = () => {
    const nextWorkout = pickRandomExercises(6);
    setGeneratedWorkout(nextWorkout);
    setCompletedWorkout(new Set());
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <WorkoutProgressWidget
          title="Current Workout Progress"
          progressPercent={currentWorkoutProgressPercent}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex-1 self-center">
                <h2 className="text-xl font-semibold">Full Body Workout Generator</h2>
                <CardProgressBar percent={workoutProgressPercent} />
              </div>

              <button
                type="button"
                onClick={toggleWorkoutCard}
                className={`h-6 w-6 shrink-0 rounded border transition-colors ${
                  completedWorkout.size === generatedWorkout.length && generatedWorkout.length > 0
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                    : "border-neutral-500 bg-transparent hover:border-neutral-300"
                }`}
                aria-label="Toggle full body workout card complete"
              >
                {completedWorkout.size === generatedWorkout.length && generatedWorkout.length > 0 ? "✓" : ""}
              </button>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={handleGenerateWorkout}
                className="rounded-xl border border-cyan-300/35 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/30"
              >
                Generate New Full Body Workout
              </button>
            </div>

            <ul className="space-y-3">
              {generatedWorkout.map((exercise) => {
                const complete = completedWorkout.has(exercise);

                return (
                  <li
                    key={exercise}
                    className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => toggleWorkoutExercise(exercise)}
                      className={`h-6 w-6 shrink-0 rounded border transition-colors ${
                        complete
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                          : "border-neutral-500 bg-transparent text-transparent hover:border-neutral-300"
                      }`}
                      aria-label={`Toggle ${exercise}`}
                    >
                      ✓
                    </button>

                    <span className={complete ? "text-neutral-500 line-through" : "text-neutral-200"}>
                      {exercise}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex-1 self-center">
                <h2 className="text-xl font-semibold">Stretch Checklist</h2>
                <CardProgressBar percent={stretchProgressPercent} />
              </div>

              <button
                type="button"
                onClick={toggleStretchCard}
                className={`h-6 w-6 shrink-0 rounded border transition-colors ${
                  completedStretches.size === stretchChecklistItems.length
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                    : "border-neutral-500 bg-transparent hover:border-neutral-300"
                }`}
                aria-label="Toggle stretch checklist card complete"
              >
                {completedStretches.size === stretchChecklistItems.length ? "✓" : ""}
              </button>
            </div>

            <ul className="space-y-3">
              {stretchChecklistItems.map((stretch) => {
                const complete = completedStretches.has(stretch);
                const isExpanded = expandedStretch === stretch;

                return (
                  <li
                    key={stretch}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleStretch(stretch)}
                        className={`h-6 w-6 shrink-0 rounded border transition-colors ${
                          complete
                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                            : "border-neutral-500 bg-transparent text-transparent hover:border-neutral-300"
                        }`}
                        aria-label={`Toggle ${stretch}`}
                      >
                        ✓
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedStretch((current) => (current === stretch ? null : stretch))}
                        className={`text-left text-sm underline-offset-2 transition-colors hover:underline ${
                          isExpanded ? "text-cyan-300" : complete ? "text-neutral-500 line-through" : "text-neutral-200"
                        }`}
                      >
                        {stretch}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                          Stretch Reference
                        </p>
                        <div className="overflow-hidden rounded-lg border border-neutral-800">
                          <StretchReferenceIllustration stretchName={stretch} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}

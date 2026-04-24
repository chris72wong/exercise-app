"use client";

import { useEffect, useMemo, useState } from "react";
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

function pickRandomExercises(count: number): string[] {
  const shuffled = [...fullBodyExercisePool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getPercent(complete: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((complete / total) * 100);
}

function getYoutubeEmbedUrl(stretchName: string): string {
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(stretchName + " stretch tutorial")}`;
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
  const [generatedWorkout, setGeneratedWorkout] = useState<string[]>(() => pickRandomExercises(6));
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

  const expandedVideoUrl = useMemo(() => {
    if (!expandedStretch) {
      return null;
    }

    return getYoutubeEmbedUrl(expandedStretch);
  }, [expandedStretch]);

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

                    {isExpanded && expandedVideoUrl && (
                      <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                          Stretch Demo
                        </p>
                        <div className="overflow-hidden rounded-lg border border-neutral-800">
                          <iframe
                            title={`${stretch} video`}
                            src={expandedVideoUrl}
                            className="h-52 w-full"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
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

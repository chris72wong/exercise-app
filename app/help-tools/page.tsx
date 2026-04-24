"use client";

import { useMemo, useState } from "react";
import WorkoutProgressWidget from "../_components/workout-progress-widget";

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

export default function HelpToolsPage() {
  const [generatedWorkout, setGeneratedWorkout] = useState<string[]>(() => pickRandomExercises(6));
  const [completedWorkout, setCompletedWorkout] = useState<Set<string>>(new Set());
  const [completedStretches, setCompletedStretches] = useState<Set<string>>(new Set());
  const [selectedStretchVideo, setSelectedStretchVideo] = useState<string | null>(null);

  const workoutProgressPercent = getPercent(completedWorkout.size, generatedWorkout.length);
  const stretchProgressPercent = getPercent(completedStretches.size, stretchChecklistItems.length);
  const pageProgressPercent = Math.round((workoutProgressPercent + stretchProgressPercent) / 2);

  const selectedVideoUrl = useMemo(() => {
    if (!selectedStretchVideo) {
      return null;
    }

    return getYoutubeEmbedUrl(selectedStretchVideo);
  }, [selectedStretchVideo]);

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
        <WorkoutProgressWidget title="Tools Progress" progressPercent={pageProgressPercent} />

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex-1 self-center">
                <h2 className="text-xl font-semibold">Full Body Workout Generator</h2>
                <div className="mt-3 mb-1 flex items-center justify-end text-[11px] font-semibold tracking-wide text-neutral-400">
                  <span>{workoutProgressPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-200"
                    style={{ width: `${workoutProgressPercent}%` }}
                  />
                </div>
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
                <div className="mt-3 mb-1 flex items-center justify-end text-[11px] font-semibold tracking-wide text-neutral-400">
                  <span>{stretchProgressPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-200"
                    style={{ width: `${stretchProgressPercent}%` }}
                  />
                </div>
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
                const isSelected = selectedStretchVideo === stretch;

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
                        onClick={() =>
                          setSelectedStretchVideo((current) => (current === stretch ? null : stretch))
                        }
                        className={`text-left text-sm underline-offset-2 transition-colors hover:underline ${
                          isSelected ? "text-cyan-300" : complete ? "text-neutral-500 line-through" : "text-neutral-200"
                        }`}
                      >
                        {stretch}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {selectedVideoUrl && selectedStretchVideo && (
              <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-3">
                <p className="mb-3 text-sm font-medium text-cyan-300">How to: {selectedStretchVideo}</p>
                <div className="overflow-hidden rounded-xl border border-neutral-800">
                  <iframe
                    title={`${selectedStretchVideo} video`}
                    src={selectedVideoUrl}
                    className="h-56 w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

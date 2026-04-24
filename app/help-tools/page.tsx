"use client";

import { useState } from "react";

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
  "Neck side stretch",
  "Chest doorway stretch",
  "Lat stretch",
  "Hip flexor stretch",
  "Seated hamstring stretch",
  "Standing quad stretch",
  "Calf wall stretch",
  "Child's pose",
];

function pickRandomExercises(count: number): string[] {
  const shuffled = [...fullBodyExercisePool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function HelpToolsPage() {
  const [generatedWorkout, setGeneratedWorkout] = useState<string[]>(() => pickRandomExercises(6));
  const [completedStretches, setCompletedStretches] = useState<Set<string>>(new Set());

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

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="mb-8 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Tools</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Quick Workout + Stretch</h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300">
            Two cards only: one full-body workout generator and one stretch checklist.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Generator
                </p>
                <h2 className="mt-2 text-xl font-semibold">Full Body Workout Generator</h2>
              </div>
              <button
                type="button"
                onClick={() => setGeneratedWorkout(pickRandomExercises(6))}
                className="rounded-xl border border-cyan-300/35 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/30"
              >
                Generate
              </button>
            </div>

            <ul className="space-y-3">
              {generatedWorkout.map((exercise, index) => (
                <li
                  key={`${exercise}-${index}`}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-200"
                >
                  {index + 1}. {exercise}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Mobility</p>
            <h2 className="mt-2 text-xl font-semibold">Stretch Checklist</h2>

            <ul className="mt-5 space-y-3">
              {stretchChecklistItems.map((stretch) => {
                const complete = completedStretches.has(stretch);

                return (
                  <li
                    key={stretch}
                    className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3"
                  >
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

                    <span className={complete ? "text-neutral-500 line-through" : "text-neutral-200"}>
                      {stretch}
                    </span>
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

"use client";

import { useEffect, useState } from "react";
import type { WorkoutDay } from "@/lib/generateWorkout";
import WorkoutProgressWidget from "../_components/workout-progress-widget";

const WORKOUT_STORAGE_KEY = "workoutPlan:v1";
const WORKOUT_COMPLETED_STORAGE_KEY = "workoutCompletedExercises:v1";

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

export default function BodybuildingDiagramPage() {
  const [currentWorkoutProgressPercent, setCurrentWorkoutProgressPercent] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    return calculateCurrentWorkoutProgress();
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCurrentWorkoutProgressPercent(calculateCurrentWorkoutProgress());
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <WorkoutProgressWidget
          title="Current Workout Progress"
          progressPercent={currentWorkoutProgressPercent}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="rounded-2xl bg-neutral-950/80 p-4">
              <svg
                viewBox="0 0 420 620"
                className="mx-auto w-full max-w-[420px]"
                role="img"
                aria-label="Front body muscle diagram"
              >
                <text x="210" y="36" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="700" opacity="0.95">
                  FRONT
                </text>

                <ellipse cx="210" cy="82" rx="40" ry="42" fill="#f8d5b8" />
                <rect x="174" y="124" width="72" height="136" rx="34" fill="#2b1d15" opacity="0.68" />
                <rect x="142" y="134" width="28" height="130" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="250" y="134" width="28" height="130" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="168" y="260" width="84" height="72" rx="26" fill="#2b1d15" opacity="0.72" />
                <rect x="178" y="332" width="28" height="200" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="214" y="332" width="28" height="200" rx="14" fill="#2b1d15" opacity="0.78" />

                <ellipse cx="176" cy="146" rx="18" ry="18" fill="#fb923c" />
                <ellipse cx="244" cy="146" rx="18" ry="18" fill="#fb923c" />
                <rect x="144" y="176" width="24" height="52" rx="11" fill="#f97316" />
                <rect x="252" y="176" width="24" height="52" rx="11" fill="#f97316" />
                <rect x="190" y="188" width="40" height="62" rx="18" fill="#fdba74" />
                <circle cx="210" cy="284" r="24" fill="#f97316" />

                <rect x="178" y="342" width="28" height="120" rx="12" fill="#ea580c" />
                <rect x="214" y="342" width="28" height="120" rx="12" fill="#ea580c" />
                <rect x="178" y="462" width="28" height="80" rx="12" fill="#fb923c" />
                <rect x="214" y="462" width="28" height="80" rx="12" fill="#fb923c" />

                <polyline points="176,146 138,132 94,114" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="20" y="104" fill="#ffffff" fontSize="13" fontWeight="600">Shoulders</text>

                <polyline points="144,192 112,196 92,208" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="20" y="220" fill="#ffffff" fontSize="13" fontWeight="600">Biceps</text>

                <polyline points="210,284 262,292 308,304" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="314" y="314" fill="#ffffff" fontSize="13" fontWeight="600">Abs</text>

                <polyline points="178,396 136,404 96,420" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="20" y="432" fill="#ffffff" fontSize="13" fontWeight="600">Quads</text>

                <polyline points="178,500 136,516 96,536" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="20" y="548" fill="#ffffff" fontSize="13" fontWeight="600">Calves</text>
              </svg>
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="rounded-2xl bg-neutral-950/80 p-4">
              <svg
                viewBox="0 0 420 620"
                className="mx-auto w-full max-w-[420px]"
                role="img"
                aria-label="Back body muscle diagram"
              >
                <text x="210" y="36" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="700" opacity="0.95">
                  BACK
                </text>

                <ellipse cx="210" cy="82" rx="40" ry="42" fill="#f8d5b8" />
                <rect x="174" y="124" width="72" height="146" rx="34" fill="#2b1d15" opacity="0.68" />
                <rect x="142" y="134" width="28" height="132" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="250" y="134" width="28" height="132" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="168" y="270" width="84" height="78" rx="26" fill="#2b1d15" opacity="0.72" />
                <rect x="178" y="348" width="28" height="194" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="214" y="348" width="28" height="194" rx="14" fill="#2b1d15" opacity="0.78" />

                <rect x="190" y="136" width="40" height="28" rx="12" fill="#fb923c" />
                <rect x="176" y="166" width="68" height="86" rx="24" fill="#f97316" />
                <rect x="144" y="176" width="24" height="52" rx="11" fill="#fb923c" />
                <rect x="252" y="176" width="24" height="52" rx="11" fill="#fb923c" />
                <circle cx="192" cy="296" r="22" fill="#ea580c" />
                <circle cx="228" cy="296" r="22" fill="#ea580c" />
                <rect x="178" y="356" width="28" height="126" rx="12" fill="#ea580c" />
                <rect x="214" y="356" width="28" height="126" rx="12" fill="#ea580c" />
                <rect x="178" y="482" width="28" height="76" rx="12" fill="#fb923c" />
                <rect x="214" y="482" width="28" height="76" rx="12" fill="#fb923c" />

                <polyline points="210,150 166,132 104,114" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="20" y="106" fill="#ffffff" fontSize="13" fontWeight="600">Traps</text>

                <polyline points="244,196 286,190 324,176" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="332" y="170" fill="#ffffff" fontSize="13" fontWeight="600">Back</text>

                <polyline points="144,188 112,192 94,204" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="20" y="216" fill="#ffffff" fontSize="13" fontWeight="600">Triceps</text>

                <polyline points="228,296 272,304 314,320" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="320" y="330" fill="#ffffff" fontSize="13" fontWeight="600">Glutes</text>

                <polyline points="242,418 286,424 324,438" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="268" y="458" fill="#ffffff" fontSize="13" fontWeight="600">Hamstrings</text>

                <polyline points="242,516 286,528 324,546" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="300" y="566" fill="#ffffff" fontSize="13" fontWeight="600">Calves</text>
              </svg>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

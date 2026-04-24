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
                <text x="210" y="36" textAnchor="middle" fill="#7dd3fc" fontSize="20" fontWeight="700" opacity="0.9">
                  FRONT
                </text>

                <ellipse cx="210" cy="82" rx="40" ry="42" fill="#f8d5b8" />
                <rect x="174" y="124" width="72" height="132" rx="34" fill="#2b1d15" opacity="0.68" />
                <rect x="142" y="138" width="28" height="122" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="250" y="138" width="28" height="122" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="168" y="258" width="84" height="80" rx="26" fill="#2b1d15" opacity="0.72" />
                <rect x="178" y="338" width="28" height="168" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="214" y="338" width="28" height="168" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="176" y="506" width="30" height="78" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="214" y="506" width="30" height="78" rx="14" fill="#2b1d15" opacity="0.78" />

                <ellipse cx="176" cy="158" rx="18" ry="18" fill="#fb923c" />
                <ellipse cx="244" cy="158" rx="18" ry="18" fill="#fb923c" />
                <rect x="144" y="196" width="24" height="58" rx="11" fill="#f97316" />
                <rect x="252" y="196" width="24" height="58" rx="11" fill="#f97316" />
                <rect x="190" y="196" width="40" height="64" rx="18" fill="#fdba74" />
                <rect x="190" y="266" width="40" height="66" rx="18" fill="#f97316" />
                <rect x="178" y="358" width="28" height="126" rx="12" fill="#ea580c" />
                <rect x="214" y="358" width="28" height="126" rx="12" fill="#ea580c" />
                <rect x="178" y="514" width="28" height="62" rx="12" fill="#fb923c" />
                <rect x="214" y="514" width="28" height="62" rx="12" fill="#fb923c" />

                <polyline points="176,158 140,150 96,134" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="20" y="126" fill="#a5f3fc" fontSize="13" fontWeight="600">Shoulders</text>

                <polyline points="144,218 110,226 92,244" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="20" y="254" fill="#a5f3fc" fontSize="13" fontWeight="600">Biceps</text>

                <polyline points="210,294 258,300 306,318" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="312" y="326" fill="#a5f3fc" fontSize="13" fontWeight="600">Abs</text>

                <polyline points="178,420 136,428 98,446" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="20" y="456" fill="#a5f3fc" fontSize="13" fontWeight="600">Quads</text>

                <polyline points="178,544 140,560 98,580" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="20" y="592" fill="#a5f3fc" fontSize="13" fontWeight="600">Calves</text>
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
                <text x="210" y="36" textAnchor="middle" fill="#7dd3fc" fontSize="20" fontWeight="700" opacity="0.9">
                  BACK
                </text>

                <ellipse cx="210" cy="82" rx="40" ry="42" fill="#f8d5b8" />
                <rect x="174" y="124" width="72" height="146" rx="34" fill="#2b1d15" opacity="0.68" />
                <rect x="142" y="138" width="28" height="126" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="250" y="138" width="28" height="126" rx="14" fill="#2b1d15" opacity="0.72" />
                <rect x="168" y="270" width="84" height="84" rx="26" fill="#2b1d15" opacity="0.72" />
                <rect x="178" y="354" width="28" height="154" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="214" y="354" width="28" height="154" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="176" y="508" width="30" height="76" rx="14" fill="#2b1d15" opacity="0.78" />
                <rect x="214" y="508" width="30" height="76" rx="14" fill="#2b1d15" opacity="0.78" />

                <rect x="190" y="136" width="40" height="28" rx="12" fill="#fb923c" />
                <rect x="176" y="168" width="68" height="94" rx="24" fill="#f97316" />
                <rect x="144" y="206" width="24" height="56" rx="11" fill="#fb923c" />
                <rect x="252" y="206" width="24" height="56" rx="11" fill="#fb923c" />
                <rect x="180" y="274" width="60" height="70" rx="22" fill="#ea580c" />
                <rect x="178" y="374" width="28" height="126" rx="12" fill="#ea580c" />
                <rect x="214" y="374" width="28" height="126" rx="12" fill="#ea580c" />
                <rect x="178" y="514" width="28" height="62" rx="12" fill="#fb923c" />
                <rect x="214" y="514" width="28" height="62" rx="12" fill="#fb923c" />

                <polyline points="210,150 166,130 104,112" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="20" y="104" fill="#a5f3fc" fontSize="13" fontWeight="600">Traps</text>

                <polyline points="244,206 290,202 326,186" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="334" y="182" fill="#a5f3fc" fontSize="13" fontWeight="600">Back</text>

                <polyline points="144,224 112,232 96,248" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="20" y="258" fill="#a5f3fc" fontSize="13" fontWeight="600">Triceps</text>

                <polyline points="210,304 266,316 308,334" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="316" y="342" fill="#a5f3fc" fontSize="13" fontWeight="600">Glutes</text>

                <polyline points="242,430 290,436 326,452" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="298" y="474" fill="#a5f3fc" fontSize="13" fontWeight="600">Hamstrings</text>
              </svg>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

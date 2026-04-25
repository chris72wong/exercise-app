"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDefaultSharedState,
  getFullBodyAndStretchProgressPercent,
  getCurrentWorkoutProgressPercent,
  type SharedAppState,
  type SharedAppStatePatch,
} from "@/lib/sharedState";
import {
  loadSharedState,
  saveSharedStatePatch,
  subscribeToSharedState,
} from "@/lib/sharedStateClient";
import {
  regeneratePushDays,
  regeneratePullDays,
  type WorkoutDay,
} from "@/lib/generateWorkout";
import { exercises } from "@/data/exercises";
import WorkoutProgressWidget from "../_components/workout-progress-widget";

const DEFAULT_SHARED_STATE = createDefaultSharedState();

type DragState = {
  dayName: string;
  exerciseName: string;
} | null;

function getExerciseMuscleGroup(exerciseName: string): string | undefined {
  return exercises.find((exercise) => exercise.name === exerciseName)?.muscleGroup;
}

function getMuscleGroupSortOrder(muscleGroup: string, focus: "Push" | "Pull"): number {
  if (focus === "Push") {
    const pushOrder: Record<string, number> = {
      Chest: 1,
      Shoulders: 2,
      Triceps: 3,
    };

    return pushOrder[muscleGroup] ?? 999;
  }

  const pullOrder: Record<string, number> = {
    Back: 1,
    Biceps: 2,
    Traps: 3,
    Abs: 4,
  };

  return pullOrder[muscleGroup] ?? 999;
}

function sortExercisesByMuscleGroup(
  exerciseList: string[],
  focus: "Push" | "Pull"
): string[] {
  return [...exerciseList].sort((exerciseA, exerciseB) => {
    const muscleA = getExerciseMuscleGroup(exerciseA);
    const muscleB = getExerciseMuscleGroup(exerciseB);

    if (!muscleA || !muscleB) {
      return 0;
    }

    return (
      getMuscleGroupSortOrder(muscleA, focus) -
      getMuscleGroupSortOrder(muscleB, focus)
    );
  });
}

function getSortedWorkout(days: WorkoutDay[]): WorkoutDay[] {
  return days.map((day) => ({
    ...day,
    exercises: sortExercisesByMuscleGroup(day.exercises, day.focus),
  }));
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [movedItem] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedItem);
  return next;
}

export default function Page() {
  const [workout, setWorkout] = useState<WorkoutDay[]>(() =>
    getSortedWorkout(DEFAULT_SHARED_STATE.workout)
  );
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set(DEFAULT_SHARED_STATE.completedExercises)
  );
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragState>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [sharedState, setSharedState] = useState<SharedAppState>(DEFAULT_SHARED_STATE);

  const applySharedState = useCallback((state: SharedAppState) => {
    setSharedState(state);
    setWorkout(getSortedWorkout(state.workout));
    setCompletedExercises(new Set(state.completedExercises));
  }, []);

  const persistSharedState = (patch: SharedAppStatePatch) => {
    void saveSharedStatePatch(patch).catch(() => {});
  };

  useEffect(() => {
    let active = true;

    void loadSharedState().then((state) => {
      if (active && state) {
        applySharedState(state);
      }
    });

    const unsubscribe = subscribeToSharedState((state) => {
      applySharedState(state);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [applySharedState]);

  const pushDays = workout.filter((day) => day.focus === "Push");
  const pullDays = workout.filter((day) => day.focus === "Pull");

  const currentWorkoutProgressPercent = getCurrentWorkoutProgressPercent(
    workout,
    completedExercises
  );
  const fullBodyProgressPercent = getFullBodyAndStretchProgressPercent(sharedState);

  const getExerciseKey = (dayName: string, exerciseName: string) => `${dayName}-${exerciseName}`;

  const getRelatedExercises = (currentExerciseName: string): string[] => {
    const muscleGroup = getExerciseMuscleGroup(currentExerciseName);
    if (!muscleGroup) return [];

    return exercises
      .filter(
        (exercise) =>
          exercise.muscleGroup === muscleGroup && exercise.name !== currentExerciseName
      )
      .map((exercise) => exercise.name)
      .sort((a, b) => a.localeCompare(b));
  };

  const isDayComplete = (day: WorkoutDay): boolean =>
    day.exercises.length > 0 &&
    day.exercises.every((exercise) =>
      completedExercises.has(getExerciseKey(day.day, exercise))
    );

  const toggleWorkoutCard = (day: WorkoutDay) => {
    const complete = isDayComplete(day);
    const next = new Set(completedExercises);

    if (complete) {
      for (const exercise of day.exercises) {
        next.delete(getExerciseKey(day.day, exercise));
      }
      setCompletedExercises(next);
      persistSharedState({ completedExercises: [...next] });
      return;
    }

    for (const exercise of day.exercises) {
      next.add(getExerciseKey(day.day, exercise));
    }
    setCompletedExercises(next);
    persistSharedState({ completedExercises: [...next] });
  };

  const handleReplaceExercise = (
    dayName: string,
    exerciseIndex: number,
    newExerciseName: string
  ) => {
    const currentDay = workout.find((day) => day.day === dayName);
    const previousExercise = currentDay?.exercises[exerciseIndex];
    if (!currentDay || !previousExercise) {
      return;
    }

    const nextWorkout = workout.map((day) => {
      if (day.day !== dayName) {
        return day;
      }

      const nextExercises = [...day.exercises];
      nextExercises[exerciseIndex] = newExerciseName;

      return {
        ...day,
        exercises: nextExercises,
      };
    });

    const nextCompleted = new Set(completedExercises);
    nextCompleted.delete(getExerciseKey(dayName, previousExercise));
    nextCompleted.delete(getExerciseKey(dayName, newExerciseName));

    setWorkout(nextWorkout);
    setCompletedExercises(nextCompleted);
    persistSharedState({
      workout: nextWorkout,
      completedExercises: [...nextCompleted],
    });

    setOpenMenuKey(null);
  };

  const toggleExerciseComplete = (dayName: string, exerciseName: string) => {
    const key = getExerciseKey(dayName, exerciseName);
    const next = new Set(completedExercises);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    setCompletedExercises(next);
    persistSharedState({ completedExercises: [...next] });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuKey === null) return;

      const target = event.target as HTMLElement;
      if (!target.closest("[data-menu-container]")) {
        setOpenMenuKey(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuKey]);

  const handleGeneratePushDays = () => {
    const nextCompleted = new Set<string>();
    setDraggedItem(null);
    setDragOverKey(null);
    const updated = regeneratePushDays(workout);
    const nextWorkout = updated.map((day) =>
      day.focus === "Push"
        ? { ...day, exercises: sortExercisesByMuscleGroup(day.exercises, "Push") }
        : day
    );

    setCompletedExercises(nextCompleted);
    setWorkout(nextWorkout);
    persistSharedState({
      workout: nextWorkout,
      completedExercises: [...nextCompleted],
    });
  };

  const handleGeneratePullDays = () => {
    const nextCompleted = new Set<string>();
    setDraggedItem(null);
    setDragOverKey(null);
    const updated = regeneratePullDays(workout);
    const nextWorkout = updated.map((day) =>
      day.focus === "Pull"
        ? { ...day, exercises: sortExercisesByMuscleGroup(day.exercises, "Pull") }
        : day
    );

    setCompletedExercises(nextCompleted);
    setWorkout(nextWorkout);
    persistSharedState({
      workout: nextWorkout,
      completedExercises: [...nextCompleted],
    });
  };

  const handleDragStart = (dayName: string, exerciseName: string) => {
    setDraggedItem({ dayName, exerciseName });
    setOpenMenuKey(null);
  };

  const handleDragOver = (dayName: string, exerciseName: string) => {
    if (!draggedItem || draggedItem.dayName !== dayName) {
      return;
    }

    setDragOverKey(getExerciseKey(dayName, exerciseName));
  };

  const handleDrop = (dayName: string, targetExerciseName: string) => {
    if (!draggedItem || draggedItem.dayName !== dayName) {
      setDraggedItem(null);
      setDragOverKey(null);
      return;
    }

    const nextWorkout = workout.map((day) => {
      if (day.day !== dayName) {
        return day;
      }

      const sourceIndex = day.exercises.indexOf(draggedItem.exerciseName);
      const targetIndex = day.exercises.indexOf(targetExerciseName);

      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        return day;
      }

      return {
        ...day,
        exercises: moveItem(day.exercises, sourceIndex, targetIndex),
      };
    });

    setWorkout(nextWorkout);
    persistSharedState({ workout: nextWorkout });

    setDraggedItem(null);
    setDragOverKey(null);
  };

  const renderWorkoutCard = (day: WorkoutDay, index: number) => {
    const dayComplete = isDayComplete(day);
    const completedCount = day.exercises.filter((exercise) =>
      completedExercises.has(getExerciseKey(day.day, exercise))
    ).length;
    const progressPercent =
      day.exercises.length > 0
        ? Math.round((completedCount / day.exercises.length) * 100)
        : 0;

    return (
      <section key={day.day} className="rounded-3xl bg-neutral-900/80 p-6 shadow-lg">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              className={`text-2xl font-semibold ${
                dayComplete ? "line-through text-neutral-500" : ""
              }`}
            >
              {day.focus} {index + 1}
            </h2>
          </div>

          <div className="flex-1 self-center">
            <div
              className={`progress-blue relative h-3 w-full overflow-visible rounded-full bg-neutral-800 ${
                progressPercent > 0 ? "progress-track-glow" : ""
              }`}
            >
              <div
                className={`relative h-full rounded-full transition-all duration-300 ${
                  progressPercent > 0 ? "progress-fill-glow" : ""
                }`}
                style={{ width: `${progressPercent}%` }}
              />
              <span
                className={`pointer-events-none absolute bottom-full mb-0.5 text-[11px] font-semibold tracking-wide transition-all ${
                  progressPercent > 0 ? "progress-label-glow" : "text-neutral-500"
                }`}
                style={{
                  left: `clamp(0%, calc(${progressPercent}% - 1.25rem), calc(100% - 2.5rem))`,
                }}
              >
                {progressPercent}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleWorkoutCard(day)}
            className={`h-6 w-6 shrink-0 rounded border transition-colors ${
              dayComplete
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                : "border-neutral-500 bg-transparent hover:border-neutral-300"
            }`}
            aria-label={`Toggle ${day.focus} ${index + 1}`}
          >
            {dayComplete ? "✓" : ""}
          </button>
        </div>

        <div className="space-y-3">
          {day.exercises.map((exercise) => {
            const exerciseKey = getExerciseKey(day.day, exercise);
            const isDragged = draggedItem?.dayName === day.day && draggedItem.exerciseName === exercise;
            const isDragOver = dragOverKey === exerciseKey;
            const exerciseComplete = completedExercises.has(exerciseKey);
            const relatedExercises = getRelatedExercises(exercise);

            return (
              <div
                key={exerciseKey}
                data-menu-container
                draggable
                onDragStart={() => handleDragStart(day.day, exercise)}
                onDragOver={(event) => {
                  event.preventDefault();
                  handleDragOver(day.day, exercise);
                }}
                onDrop={() => handleDrop(day.day, exercise)}
                onDragEnd={() => {
                  setDraggedItem(null);
                  setDragOverKey(null);
                }}
                className={`relative flex items-center rounded-2xl px-4 py-3 cursor-grab transition-all ${
                  isDragged
                    ? "opacity-50 bg-neutral-950/40"
                    : isDragOver
                      ? "bg-neutral-800 shadow-lg"
                      : "bg-neutral-950/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExerciseComplete(day.day, exercise)}
                  aria-label={`Mark ${exercise} complete`}
                  className={`mr-3 h-6 w-6 shrink-0 rounded border transition-colors ${
                    exerciseComplete
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                      : "border-neutral-500 bg-transparent text-transparent hover:border-neutral-300"
                  }`}
                >
                  {exerciseComplete ? "✓" : ""}
                </button>

                <div>
                  <p
                    className={`font-medium ${
                      exerciseComplete ? "text-neutral-500 line-through" : "text-white"
                    }`}
                  >
                    {exercise}
                  </p>
                </div>

                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuKey((current) => (current === exerciseKey ? null : exerciseKey))
                    }
                    className="rounded p-1 transition-colors hover:bg-neutral-800"
                    aria-label={`Open alternatives for ${exercise}`}
                  >
                    <span className="text-lg text-neutral-300">⋯</span>
                  </button>

                  {openMenuKey === exerciseKey && (
                    <div className="absolute right-0 top-full z-10 mt-2 max-h-64 w-52 overflow-y-auto rounded-lg bg-neutral-800 shadow-lg">
                      {relatedExercises.map((relatedExercise) => (
                        <button
                          key={relatedExercise}
                          type="button"
                          onClick={() =>
                            handleReplaceExercise(
                              day.day,
                              day.exercises.indexOf(exercise),
                              relatedExercise
                            )
                          }
                          className="block w-full px-4 py-2 text-left text-sm text-white transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-neutral-700"
                        >
                          {relatedExercise}
                        </button>
                      ))}

                      {relatedExercises.length === 0 && (
                        <div className="px-4 py-2 text-sm text-neutral-400">No alternatives</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <WorkoutProgressWidget
            title="Progress Bar 1"
            progressPercent={currentWorkoutProgressPercent}
            variant="blue"
          />
          <WorkoutProgressWidget
            title="Progress Bar 2"
            progressPercent={fullBodyProgressPercent}
            variant="red"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={handleGeneratePushDays}
            className="rounded-xl border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-500/30"
          >
            Generate New Push Days
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pushDays.map((day, index) => renderWorkoutCard(day, index))}
        </div>

        <div className="my-8 flex flex-wrap gap-3">
          <button
            onClick={handleGeneratePullDays}
            className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/30"
          >
            Generate New Pull Days
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pullDays.map((day, index) => renderWorkoutCard(day, index))}
        </div>

      </div>
    </main>
  );
}

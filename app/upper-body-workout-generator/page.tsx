"use client";

import { useEffect, useState } from "react";
import Holidays from "date-holidays";
import {
  generate4DaySplit,
  regeneratePushDays,
  regeneratePullDays,
  type WorkoutDay,
} from "@/lib/generateWorkout";
import { exercises } from "@/data/exercises";

const WORKOUT_STORAGE_KEY = "workoutPlan:v1";

type CalendarCell = {
  date: number;
  dateKey: string;
  isToday: boolean;
  isCardWorkout: boolean;
  isManualWorkout: boolean;
  holidayName?: string;
} | null;

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

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey(): string {
  return formatDateKey(new Date());
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function getCurrentMonthCalendar(
  displayMonth: Date,
  cardDates: Set<string>,
  manualDates: Set<string>
): CalendarCell[] {
  const daysInMonth = getDaysInMonth(displayMonth);
  const firstDay = getFirstDayOfMonth(displayMonth);
  const calendar: CalendarCell[] = [];
  const holidays = new Holidays("CA");
  const holidayMap = new Map<string, string>();

  for (const holiday of holidays.getHolidays(displayMonth.getFullYear())) {
    const holidayDate = new Date(holiday.start);
    const holidayKey = formatDateKey(holidayDate);

    if (holidayDate.getMonth() === displayMonth.getMonth() && holiday.type !== "observance") {
      holidayMap.set(holidayKey, holiday.name);
    }
  }

  for (let index = 0; index < firstDay; index += 1) {
    calendar.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    const dateKey = formatDateKey(date);

    calendar.push({
      date: day,
      dateKey,
      isToday: dateKey === getTodayKey(),
      isCardWorkout: cardDates.has(dateKey),
      isManualWorkout: manualDates.has(dateKey),
      holidayName: holidayMap.get(dateKey),
    });
  }

  return calendar;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [movedItem] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedItem);
  return next;
}

export default function Page() {
  const [showIntro, setShowIntro] = useState(true);
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const [workout, setWorkout] = useState<WorkoutDay[]>(() => {
    const getSortedWorkout = (days: WorkoutDay[]): WorkoutDay[] =>
      days.map((day) => ({
        ...day,
        exercises: sortExercisesByMuscleGroup(day.exercises, day.focus),
      }));

    if (typeof window === "undefined") {
      return getSortedWorkout(generate4DaySplit());
    }

    try {
      const storedWorkout = window.localStorage.getItem(WORKOUT_STORAGE_KEY);
      if (storedWorkout) {
        const parsedWorkout = JSON.parse(storedWorkout) as WorkoutDay[];
        if (Array.isArray(parsedWorkout)) {
          return getSortedWorkout(parsedWorkout);
        }
      }
    } catch {
      // Ignore malformed localStorage values and regenerate plan.
    }

    return getSortedWorkout(generate4DaySplit());
  });
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set()
  );
  const [cardCompletedDates, setCardCompletedDates] = useState<Set<string>>(
    () => new Set()
  );
  const [manualCompletedDates, setManualCompletedDates] = useState<Set<string>>(
    () => new Set()
  );
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragState>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workout));
    } catch {
      // Ignore storage write failures.
    }
  }, [workout]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introDurationMs = prefersReducedMotion ? 80 : 1700;
    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, introDurationMs);

    return () => window.clearTimeout(timer);
  }, []);

  const pushDays = workout.filter((day) => day.focus === "Push");
  const pullDays = workout.filter((day) => day.focus === "Pull");
  const todayKey = getTodayKey();

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

  const syncTodayToWorkout = () => {
    setCardCompletedDates((prev) => {
      if (prev.has(todayKey)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(todayKey);
      return next;
    });
  };

  const toggleWorkoutCard = (day: WorkoutDay) => {
    const complete = isDayComplete(day);

    if (complete) {
      setCompletedExercises((prev) => {
        const next = new Set(prev);
        for (const exercise of day.exercises) {
          next.delete(getExerciseKey(day.day, exercise));
        }
        return next;
      });
      return;
    }

    setCompletedExercises((prev) => {
      const next = new Set(prev);
      for (const exercise of day.exercises) {
        next.add(getExerciseKey(day.day, exercise));
      }
      return next;
    });

    syncTodayToWorkout();
  };

  const toggleCalendarDate = (dateKey: string) => {
    if (manualCompletedDates.has(dateKey)) {
      setManualCompletedDates((prev) => {
        const next = new Set(prev);
        next.delete(dateKey);
        return next;
      });
      return;
    }

    if (cardCompletedDates.has(dateKey)) {
      setCardCompletedDates((prev) => {
        const next = new Set(prev);
        next.delete(dateKey);
        return next;
      });
      return;
    }

    setManualCompletedDates((prev) => {
      const next = new Set(prev);
      next.add(dateKey);
      return next;
    });
  };

  const handleReplaceExercise = (
    dayName: string,
    exerciseIndex: number,
    newExerciseName: string
  ) => {
    setWorkout((prev) =>
      prev.map((day) => {
        if (day.day !== dayName) {
          return day;
        }

        const nextExercises = [...day.exercises];
        const previousExercise = nextExercises[exerciseIndex];
        nextExercises[exerciseIndex] = newExerciseName;

        setCompletedExercises((current) => {
          const next = new Set(current);
          next.delete(getExerciseKey(dayName, previousExercise));
          next.delete(getExerciseKey(dayName, newExerciseName));
          return next;
        });

        return {
          ...day,
          exercises: nextExercises,
        };
      })
    );

    setOpenMenuKey(null);
  };

  const toggleExerciseComplete = (dayName: string, exerciseName: string) => {
    const key = getExerciseKey(dayName, exerciseName);
    const workoutDay = workout.find((day) => day.day === dayName);

    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      if (
        workoutDay &&
        workoutDay.exercises.every((exercise) =>
          exercise === exerciseName ? next.has(key) : next.has(getExerciseKey(dayName, exercise))
        )
      ) {
        syncTodayToWorkout();
      }

      return next;
    });
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
    setCompletedExercises(new Set());
    setDraggedItem(null);
    setDragOverKey(null);
    setWorkout((prev) => {
      const updated = regeneratePushDays(prev);
      return updated.map((day) =>
        day.focus === "Push"
          ? { ...day, exercises: sortExercisesByMuscleGroup(day.exercises, "Push") }
          : day
      );
    });
  };

  const handleGeneratePullDays = () => {
    setCompletedExercises(new Set());
    setDraggedItem(null);
    setDragOverKey(null);
    setWorkout((prev) => {
      const updated = regeneratePullDays(prev);
      return updated.map((day) =>
        day.focus === "Pull"
          ? { ...day, exercises: sortExercisesByMuscleGroup(day.exercises, "Pull") }
          : day
      );
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

    setWorkout((prev) =>
      prev.map((day) => {
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
      })
    );

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
            <div className="mb-1 flex items-center justify-end text-[11px] font-semibold tracking-wide text-neutral-400">
              <span>{progressPercent}%</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
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

  const calendarCells = getCurrentMonthCalendar(
    displayMonth,
    cardCompletedDates,
    manualCompletedDates
  );
  const monthLabel = displayMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setDisplayMonth(new Date());
  };

  return (
    <>
      {showIntro && (
        <div className="intro-overlay" aria-hidden="true">
          <p className="intro-title">WELCOME</p>
          <p className="intro-subtitle">TO GYM PARTNER</p>
        </div>
      )}

      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
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

        <div className="mt-16 rounded-3xl bg-neutral-900/80 p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Workout Tracker</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Today is outlined. Workout dates stay marked until you clear them on the calendar.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-neutral-950/70 px-2 py-1 text-sm text-neutral-300">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-full px-2 py-1 transition-colors hover:bg-neutral-800"
                aria-label="Previous month"
              >
                ←
              </button>

              <button
                type="button"
                onClick={goToCurrentMonth}
                className="rounded px-1 py-1 transition-colors hover:bg-neutral-800"
                aria-label="Go to current month"
              >
                {monthLabel}
              </button>

              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-full px-2 py-1 transition-colors hover:bg-neutral-800"
                aria-label="Next month"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400"
              >
                {day}
              </div>
            ))}

            {calendarCells.map((cell, index) => (
              <div key={index} className="aspect-square">
                {cell ? (
                  <button
                    type="button"
                    onClick={() => toggleCalendarDate(cell.dateKey)}
                    className={`relative flex h-full w-full flex-col items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                      cell.isManualWorkout
                        ? "bg-blue-500/25 text-blue-200"
                        : cell.isCardWorkout
                          ? "bg-emerald-500/25 text-emerald-200"
                        : cell.holidayName
                          ? "bg-amber-500/15 text-amber-100 hover:bg-amber-500/20"
                          : "bg-neutral-950/70 text-white hover:bg-neutral-900"
                    } ${cell.isToday ? "ring-2 ring-amber-400" : ""}`}
                    aria-label={`Toggle workout date ${cell.dateKey}`}
                  >
                    <span>{cell.date}</span>

                    {cell.holidayName && (
                      <span className="mt-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                        {cell.holidayName}
                      </span>
                    )}

                    {(cell.isCardWorkout || cell.isManualWorkout) && (
                      <span
                        className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${
                          cell.isManualWorkout ? "bg-blue-400" : "bg-emerald-400"
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
      </main>
    </>
  );
}

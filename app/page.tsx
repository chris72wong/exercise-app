"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Holidays from "date-holidays";
import type { WorkoutDay } from "@/lib/generateWorkout";
import WorkoutProgressWidget from "./_components/workout-progress-widget";

const INTRO_SEEN_STORAGE_KEY = "homeIntroSeen:v1";
const HOME_CALENDAR_STORAGE_KEY = "homeCalendarCompletedDates:v1";
const WORKOUT_STORAGE_KEY = "workoutPlan:v1";
const WORKOUT_COMPLETED_STORAGE_KEY = "workoutCompletedExercises:v1";

type CalendarCell = {
  date: number;
  dateKey: string;
  isToday: boolean;
  isComplete: boolean;
  holidayName?: string;
} | null;

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

function getCurrentMonthCalendar(displayMonth: Date, completedDates: Set<string>): CalendarCell[] {
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
      isComplete: completedDates.has(dateKey),
      holidayName: holidayMap.get(dateKey),
    });
  }

  return calendar;
}

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      return window.localStorage.getItem(INTRO_SEEN_STORAGE_KEY) !== "true";
    } catch {
      return false;
    }
  });
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const [completedDates, setCompletedDates] = useState<Set<string>>(() => {
    if (typeof window === "undefined") {
      return new Set();
    }

    try {
      const storedDates = window.localStorage.getItem(HOME_CALENDAR_STORAGE_KEY);
      if (!storedDates) {
        return new Set();
      }

      const parsedDates = JSON.parse(storedDates) as string[];
      if (!Array.isArray(parsedDates)) {
        return new Set();
      }

      return new Set(parsedDates);
    } catch {
      return new Set();
    }
  });
  const [exercisePageProgressPercent, setExercisePageProgressPercent] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }

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
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(HOME_CALENDAR_STORAGE_KEY, JSON.stringify([...completedDates]));
    } catch {
      // Ignore storage write failures.
    }
  }, [completedDates]);

  useEffect(() => {
    if (!showIntro) {
      return;
    }

    try {
      window.localStorage.setItem(INTRO_SEEN_STORAGE_KEY, "true");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const introDurationMs = prefersReducedMotion ? 80 : 1700;
      const timer = window.setTimeout(() => {
        setShowIntro(false);
      }, introDurationMs);

      return () => window.clearTimeout(timer);
    } catch {
      // Ignore storage read/write failures.
    }
  }, [showIntro]);

  useEffect(() => {
    const calculateInProgressPercent = (): number => {
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
    };

    const handleStorageUpdate = () => {
      setExercisePageProgressPercent(calculateInProgressPercent());
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  const calendarCells = getCurrentMonthCalendar(displayMonth, completedDates);
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

  const toggleCalendarDate = (dateKey: string) => {
    setCompletedDates((prev) => {
      const next = new Set(prev);

      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }

      return next;
    });
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
        <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-8">
          <header className="mb-12 flex items-center justify-center">
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold hover:bg-neutral-800">
                Menu
              </summary>

              <nav className="absolute left-1/2 z-20 mt-2 w-72 -translate-x-1/2 rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-xl">
                <p className="mb-2 px-2 text-xs uppercase tracking-wide text-neutral-400">Pages</p>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/upper-body-workout-generator"
                      className="block rounded-lg px-3 py-2 text-sm text-neutral-100 transition-colors hover:bg-neutral-800"
                    >
                      Upper Body Workout Generator
                    </Link>
                  </li>
                </ul>
              </nav>
            </details>
          </header>

          <WorkoutProgressWidget
            title="Current Workout Progress"
            progressPercent={exercisePageProgressPercent}
          />

          <div className="rounded-3xl bg-neutral-900/80 p-6 shadow-lg">

            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Workout Tracker</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Today is outlined. Toggle dates to mark workout days.
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
                        cell.isComplete
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

                      {cell.isComplete && (
                        <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-400" />
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

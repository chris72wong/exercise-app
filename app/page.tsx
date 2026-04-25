"use client";

import { useEffect, useState } from "react";
import Holidays from "date-holidays";
import type { WorkoutDay } from "@/lib/generateWorkout";
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
import WorkoutProgressWidget from "./_components/workout-progress-widget";

const DEFAULT_SHARED_STATE = createDefaultSharedState();

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
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const [completedDates, setCompletedDates] = useState<Set<string>>(
    () => new Set(DEFAULT_SHARED_STATE.completedDates)
  );
  const [workout, setWorkout] = useState<WorkoutDay[]>(DEFAULT_SHARED_STATE.workout);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set(DEFAULT_SHARED_STATE.completedExercises)
  );
  const [sharedState, setSharedState] = useState<SharedAppState>(DEFAULT_SHARED_STATE);

  const applySharedState = (state: SharedAppState) => {
    setSharedState(state);
    setCompletedDates(new Set(state.completedDates));
    setWorkout(state.workout);
    setCompletedExercises(new Set(state.completedExercises));
  };

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
  }, []);

  const calendarCells = getCurrentMonthCalendar(displayMonth, completedDates);
  const exercisePageProgressPercent = getCurrentWorkoutProgressPercent(
    workout,
    completedExercises
  );
  const fullBodyProgressPercent = getFullBodyAndStretchProgressPercent(sharedState);
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
    const next = new Set(completedDates);

    if (next.has(dateKey)) {
      next.delete(dateKey);
    } else {
      next.add(dateKey);
    }

    setCompletedDates(next);
    persistSharedState({ completedDates: [...next] });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <WorkoutProgressWidget
            title="Progress Bar 1"
            progressPercent={exercisePageProgressPercent}
            variant="blue"
          />
          <WorkoutProgressWidget
            title="Progress Bar 2"
            progressPercent={fullBodyProgressPercent}
            variant="red"
          />
        </div>

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
  );
}

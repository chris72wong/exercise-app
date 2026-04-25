"use client";

import { useEffect, useState } from "react";
import Holidays from "date-holidays";
import type { WorkoutDay } from "@/lib/generateWorkout";
import {
  createDefaultSharedState,
  getFullBodyAndStretchProgressPercent,
  getCurrentWorkoutProgressPercent,
  type CalendarActivitiesByDate,
  type CalendarActivity,
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
  activities: CalendarActivity[];
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

function getCurrentMonthCalendar(
  displayMonth: Date,
  calendarActivities: CalendarActivitiesByDate
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
      activities: calendarActivities[dateKey] ?? [],
      holidayName: holidayMap.get(dateKey),
    });
  }

  return calendar;
}

function getDateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatSelectedDate(dateKey: string): string {
  return getDateFromKey(dateKey).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function sortActivities(activities: CalendarActivity[]): CalendarActivity[] {
  const activitySet = new Set(activities);
  return (["cardio", "weights"] as CalendarActivity[]).filter((activity) =>
    activitySet.has(activity)
  );
}

function getCalendarCellActivityClasses(activities: CalendarActivity[], hasHoliday: boolean): string {
  const hasCardio = activities.includes("cardio");
  const hasWeights = activities.includes("weights");

  if (hasCardio && hasWeights) {
    return "calendar-date-both text-white hover:brightness-110";
  }

  if (hasCardio) {
    return "bg-purple-500/25 text-purple-100 hover:bg-purple-500/35";
  }

  if (hasWeights) {
    return "bg-amber-500/25 text-amber-100 hover:bg-amber-500/35";
  }

  if (hasHoliday) {
    return "bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20";
  }

  return "bg-neutral-950/70 text-white hover:bg-neutral-900";
}

export default function HomePage() {
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const [calendarActivities, setCalendarActivities] = useState<CalendarActivitiesByDate>(
    () => DEFAULT_SHARED_STATE.calendarActivities
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [workout, setWorkout] = useState<WorkoutDay[]>(DEFAULT_SHARED_STATE.workout);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set(DEFAULT_SHARED_STATE.completedExercises)
  );
  const [sharedState, setSharedState] = useState<SharedAppState>(DEFAULT_SHARED_STATE);

  const applySharedState = (state: SharedAppState) => {
    setSharedState(state);
    setCalendarActivities(state.calendarActivities);
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

  const calendarCells = getCurrentMonthCalendar(displayMonth, calendarActivities);
  const selectedCalendarCell =
    calendarCells.find((cell): cell is NonNullable<CalendarCell> => {
      return cell?.dateKey === selectedDateKey;
    }) ?? null;
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
    setSelectedDateKey(null);
  };

  const goToNextMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    setSelectedDateKey(null);
  };

  const goToCurrentMonth = () => {
    setDisplayMonth(new Date());
    setSelectedDateKey(null);
  };

  const toggleCalendarActivity = (dateKey: string, activity: CalendarActivity) => {
    const currentActivities = calendarActivities[dateKey] ?? [];
    const nextActivities = currentActivities.includes(activity)
      ? currentActivities.filter((currentActivity) => currentActivity !== activity)
      : sortActivities([...currentActivities, activity]);
    const nextCalendarActivities = { ...calendarActivities };

    if (nextActivities.length > 0) {
      nextCalendarActivities[dateKey] = nextActivities;
    } else {
      delete nextCalendarActivities[dateKey];
    }

    setCalendarActivities(nextCalendarActivities);
    persistSharedState({
      calendarActivities: nextCalendarActivities,
      completedDates: Object.keys(nextCalendarActivities),
    });
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
                Today is outlined. Pick a date to log cardio or weights.
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
                    onClick={() =>
                      setSelectedDateKey((currentDateKey) =>
                        currentDateKey === cell.dateKey ? null : cell.dateKey
                      )
                    }
                    className={`relative flex h-full w-full flex-col items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                      getCalendarCellActivityClasses(cell.activities, Boolean(cell.holidayName))
                    } ${
                      selectedDateKey === cell.dateKey
                        ? "calendar-date-selected"
                        : cell.isToday
                          ? "ring-2 ring-emerald-400"
                          : ""
                    }`}
                    aria-label={`Open calendar options for ${cell.dateKey}`}
                  >
                    <span>{cell.date}</span>

                    {cell.holidayName && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    )}

                    {cell.activities.length > 0 && (
                      <span className="absolute bottom-1 flex gap-1">
                        {cell.activities.includes("cardio") && (
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                        )}
                        {cell.activities.includes("weights") && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                        )}
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
            ))}
          </div>

          {selectedCalendarCell && (
            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatSelectedDate(selectedCalendarCell.dateKey)}
                  </p>
                  {selectedCalendarCell.holidayName && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                      {selectedCalendarCell.holidayName}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCalendarActivity(selectedCalendarCell.dateKey, "cardio")}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      selectedCalendarCell.activities.includes("cardio")
                        ? "border-purple-300 bg-purple-500/30 text-purple-100"
                        : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                    }`}
                  >
                    Cardio
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCalendarActivity(selectedCalendarCell.dateKey, "weights")}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      selectedCalendarCell.activities.includes("weights")
                        ? "border-amber-300 bg-amber-500/30 text-amber-100"
                        : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                    }`}
                  >
                    Weights
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

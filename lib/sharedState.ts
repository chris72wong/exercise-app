import fullBodyExercises from "@/data/exercises/full-body.json";
import type { WorkoutDay } from "@/lib/generateWorkout";

export const SHARED_STATE_ID = "global";
export const FULL_BODY_WORKOUT_SIZE = 6;

export type FullBodyExercise = {
  name: string;
  muscleGroup: "Legs" | "Back" | "Shoulders";
  movementPattern: string;
  equipment: string;
  type: string;
  slotType: string;
};

export type SharedAppState = {
  workout: WorkoutDay[];
  completedExercises: string[];
  completedDates: string[];
  generatedFullBodyWorkout: string[];
  completedFullBodyExercises: string[];
  completedStretches: string[];
};

export type SharedAppStatePatch = Partial<SharedAppState>;

export const fullBodyExercisePool = fullBodyExercises as FullBodyExercise[];

export const stretchChecklistItems = [
  "Standing Quad Stretch",
  "Standing Calf Stretch",
  "Seated Single-Leg Hamstring Stretch",
  "Single Knee-to-Chest Stretch",
  "Seated Butterfly Stretch",
  "Supine Figure-Four Stretch",
];

const DEFAULT_WORKOUT: WorkoutDay[] = [
  {
    day: "Day 1",
    focus: "Push",
    exercises: [
      "Barbell Bench Press",
      "Incline Dumbbell Press",
      "Barbell Overhead Press",
      "Lateral Raise",
      "Tricep Pushdown",
      "Overhead Tricep Extension",
    ],
  },
  {
    day: "Day 2",
    focus: "Pull",
    exercises: [
      "Pull Up",
      "Barbell Row",
      "Barbell Curl",
      "Hammer Curl",
      "Barbell Shrug",
      "Plank",
    ],
  },
  {
    day: "Day 3",
    focus: "Push",
    exercises: [
      "Flat Dumbbell Press",
      "Cable Fly",
      "Dumbbell Shoulder Press",
      "Cable Lateral Raise",
      "Skull Crusher",
      "Dumbbell Overhead Extension",
    ],
  },
  {
    day: "Day 4",
    focus: "Pull",
    exercises: [
      "Lat Pulldown",
      "Seated Cable Row",
      "EZ Bar Curl",
      "Cable Curl",
      "Face Pull",
      "Cable Crunch",
    ],
  },
];

export function generateFullBodyWorkout(): string[] {
  const pick = (muscleGroup: FullBodyExercise["muscleGroup"], count: number) =>
    [...fullBodyExercisePool]
      .filter((exercise) => exercise.muscleGroup === muscleGroup && exercise.type === "Compound")
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((exercise) => exercise.name);

  return [
    ...pick("Legs", 3),
    ...pick("Back", 1),
    ...pick("Shoulders", 2),
  ];
}

export function getFullBodyExerciseMuscleGroup(exerciseName: string): string | undefined {
  return fullBodyExercisePool.find((exercise) => exercise.name === exerciseName)?.muscleGroup;
}

export function createDefaultSharedState(): SharedAppState {
  return {
    workout: DEFAULT_WORKOUT,
    completedExercises: [],
    completedDates: [],
    generatedFullBodyWorkout: [
      "Goblet Squat",
      "Romanian Deadlift",
      "Walking Lunge",
      "Pull Up",
      "Barbell Overhead Press",
      "Dumbbell Shoulder Press",
    ],
    completedFullBodyExercises: [],
    completedStretches: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isWorkoutDay(value: unknown): value is WorkoutDay {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.day === "string" &&
    (value.focus === "Push" || value.focus === "Pull") &&
    isStringArray(value.exercises)
  );
}

function isWorkout(value: unknown): value is WorkoutDay[] {
  return Array.isArray(value) && value.every(isWorkoutDay);
}

export function normalizeSharedState(value: unknown): SharedAppState {
  const fallback = createDefaultSharedState();
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    workout: isWorkout(value.workout) ? value.workout : fallback.workout,
    completedExercises: isStringArray(value.completedExercises)
      ? value.completedExercises
      : fallback.completedExercises,
    completedDates: isStringArray(value.completedDates)
      ? value.completedDates
      : fallback.completedDates,
    generatedFullBodyWorkout: isStringArray(value.generatedFullBodyWorkout)
      ? value.generatedFullBodyWorkout
      : fallback.generatedFullBodyWorkout,
    completedFullBodyExercises: isStringArray(value.completedFullBodyExercises)
      ? value.completedFullBodyExercises
      : fallback.completedFullBodyExercises,
    completedStretches: isStringArray(value.completedStretches)
      ? value.completedStretches
      : fallback.completedStretches,
  };
}

export function normalizeSharedStatePatch(value: unknown): SharedAppStatePatch {
  if (!isRecord(value)) {
    return {};
  }

  const patch: SharedAppStatePatch = {};

  if (isWorkout(value.workout)) {
    patch.workout = value.workout;
  }

  if (isStringArray(value.completedExercises)) {
    patch.completedExercises = value.completedExercises;
  }

  if (isStringArray(value.completedDates)) {
    patch.completedDates = value.completedDates;
  }

  if (isStringArray(value.generatedFullBodyWorkout)) {
    patch.generatedFullBodyWorkout = value.generatedFullBodyWorkout;
  }

  if (isStringArray(value.completedFullBodyExercises)) {
    patch.completedFullBodyExercises = value.completedFullBodyExercises;
  }

  if (isStringArray(value.completedStretches)) {
    patch.completedStretches = value.completedStretches;
  }

  return patch;
}

export function getCurrentWorkoutProgressPercent(
  workout: WorkoutDay[],
  completedExercises: Set<string> | string[]
): number {
  const completedSet =
    completedExercises instanceof Set ? completedExercises : new Set(completedExercises);

  for (const day of workout) {
    if (day.exercises.length === 0) {
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
}

export function getFullBodyAndStretchProgressPercent(state: SharedAppState): number {
  const total = state.generatedFullBodyWorkout.length + stretchChecklistItems.length;
  if (total === 0) {
    return 0;
  }

  return Math.round(
    ((state.completedFullBodyExercises.length + state.completedStretches.length) / total) * 100
  );
}

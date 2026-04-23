import { exercises } from "@/data/exercises";

export type WorkoutDay = {
  day: string;
  focus: "Push" | "Pull";
  exercises: string[];
};

type MuscleGroup = "Chest" | "Shoulders" | "Triceps" | "Back" | "Biceps" | "Traps";
type DayQuota = Partial<Record<MuscleGroup, number>>;

const PUSH_QUOTA: DayQuota = {
  Chest: 2,
  Shoulders: 2,
  Triceps: 2,
};

const PULL_QUOTA: DayQuota = {
  Back: 2,
  Biceps: 2,
  Traps: 1,
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickByMuscleGroup(
  muscleGroup: MuscleGroup,
  count: number,
  exclude: Set<string>
): string[] {
  const candidates = exercises
    .filter((exercise) => exercise.muscleGroup === muscleGroup)
    .map((exercise) => exercise.name)
    .filter((name) => !exclude.has(name));

  if (candidates.length < count) {
    throw new Error(`Not enough ${muscleGroup} exercises to build a unique day.`);
  }

  const selected = shuffle(candidates).slice(0, count);
  for (const exerciseName of selected) {
    exclude.add(exerciseName);
  }

  return selected;
}

function buildDayExercises(quota: DayQuota, exclude: Set<string>): string[] {
  const picks: string[] = [];

  for (const [muscleGroup, count] of Object.entries(quota) as Array<[
    MuscleGroup,
    number,
  ]>) {
    picks.push(...pickByMuscleGroup(muscleGroup, count, exclude));
  }

  return shuffle(picks);
}

function createDay(
  day: string,
  focus: "Push" | "Pull",
  quota: DayQuota,
  exclude: Set<string>
): WorkoutDay {
  return {
    day,
    focus,
    exercises: buildDayExercises(quota, exclude),
  };
}

export function generate4DaySplit(): WorkoutDay[] {
  const exclude = new Set<string>();

  return [
    createDay("Day 1", "Push", PUSH_QUOTA, exclude),
    createDay("Day 2", "Pull", PULL_QUOTA, exclude),
    createDay("Day 3", "Push", PUSH_QUOTA, exclude),
    createDay("Day 4", "Pull", PULL_QUOTA, exclude),
  ];
}

export function regeneratePushDays(current: WorkoutDay[]): WorkoutDay[] {
  const next = current.map((d) => ({ ...d, exercises: [...d.exercises] }));

  const usedNames = new Set(
    next.filter((d) => d.focus === "Pull").flatMap((d) => d.exercises)
  );

  for (const day of next) {
    if (day.focus === "Push") {
      day.exercises = buildDayExercises(PUSH_QUOTA, usedNames);
    }
  }

  return next;
}

export function regeneratePullDays(current: WorkoutDay[]): WorkoutDay[] {
  const next = current.map((d) => ({ ...d, exercises: [...d.exercises] }));

  const usedNames = new Set(
    next.filter((d) => d.focus === "Push").flatMap((d) => d.exercises)
  );

  for (const day of next) {
    if (day.focus === "Pull") {
      day.exercises = buildDayExercises(PULL_QUOTA, usedNames);
    }
  }

  return next;
}
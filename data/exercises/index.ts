import abs from "./abs.json";
import back from "./back.json";
import biceps from "./biceps.json";
import chest from "./chest.json";
import triceps from "./triceps.json";
import shoulders from "./shoulders.json";
import traps from "./traps.json";

export type Exercise = {
  name: string;
  muscleGroup: string;
  movementPattern: string;
  equipment: string;
  type: string;
  slotType: string;
};

const backExercises = back as Exercise[];
const absExercises = abs as Exercise[];
const bicepsExercises = biceps as Exercise[];
const chestExercises = chest as Exercise[];
const tricepsExercises = triceps as Exercise[];
const shouldersExercises = shoulders as Exercise[];
const trapsExercises = traps as Exercise[];

export const exercises: Exercise[] = [
  ...absExercises,
  ...backExercises,
  ...bicepsExercises,
  ...chestExercises,
  ...tricepsExercises,
  ...shouldersExercises,
  ...trapsExercises,
];

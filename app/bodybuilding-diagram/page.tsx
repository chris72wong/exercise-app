"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { exercises } from "@/data/exercises";
import {
  createDefaultSharedState,
  fullBodyExercisePool,
  getFullBodyAndStretchProgressPercent,
  getCurrentWorkoutProgressPercent,
  type SharedAppState,
} from "@/lib/sharedState";
import {
  loadSharedState,
  subscribeToSharedState,
} from "@/lib/sharedStateClient";
import WorkoutProgressWidget from "../_components/workout-progress-widget";

const DEFAULT_SHARED_STATE = createDefaultSharedState();

type DiagramSide = "front" | "back";
type DiagramMuscleGroup =
  | "Abs"
  | "Back"
  | "Biceps"
  | "Calves"
  | "Chest"
  | "Glutes"
  | "Hamstrings"
  | "Quads"
  | "Shoulders"
  | "Traps"
  | "Triceps";

type ActiveMuscleSelection = {
  side: DiagramSide;
  muscleGroup: DiagramMuscleGroup;
};

type MuscleLabelProps = {
  points: string;
  x: number;
  y: number;
  muscleGroup: DiagramMuscleGroup;
  isSelected: boolean;
  onSelect: (muscleGroup: DiagramMuscleGroup) => void;
  children: string;
  textAnchor?: "start" | "middle" | "end";
};

function getExercisesForMuscleGroup(muscleGroup: DiagramMuscleGroup): string[] {
  if (muscleGroup === "Quads") {
    return fullBodyExercisePool
      .filter((exercise) => ["Squat", "Lunge"].includes(exercise.movementPattern))
      .map((exercise) => exercise.name)
      .sort((a, b) => a.localeCompare(b));
  }

  if (muscleGroup === "Glutes") {
    return fullBodyExercisePool
      .filter((exercise) => ["Hip Hinge", "Lunge"].includes(exercise.movementPattern))
      .map((exercise) => exercise.name)
      .sort((a, b) => a.localeCompare(b));
  }

  if (muscleGroup === "Hamstrings") {
    return fullBodyExercisePool
      .filter((exercise) => exercise.movementPattern === "Hip Hinge")
      .map((exercise) => exercise.name)
      .sort((a, b) => a.localeCompare(b));
  }

  if (muscleGroup === "Calves") {
    return ["Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Press"];
  }

  return exercises
    .filter((exercise) => exercise.muscleGroup === muscleGroup)
    .map((exercise) => exercise.name)
    .sort((a, b) => a.localeCompare(b));
}

function MuscleLabel({
  points,
  x,
  y,
  muscleGroup,
  isSelected,
  onSelect,
  children,
  textAnchor = "start",
}: MuscleLabelProps) {
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(muscleGroup);
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      className={`cursor-pointer outline-none transition-colors hover:text-emerald-300 focus:text-emerald-300 ${
        isSelected ? "text-emerald-300" : "text-neutral-100"
      }`}
      aria-label={`Show ${muscleGroup} exercises`}
      onClick={() => onSelect(muscleGroup)}
      onKeyDown={handleKeyDown}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <text x={x} y={y} fill="currentColor" fontSize="13" fontWeight="600" textAnchor={textAnchor}>
        {children}
      </text>
    </g>
  );
}

type MuscleDiagramProps = {
  selectedMuscleGroup: DiagramMuscleGroup | null;
  onSelect: (muscleGroup: DiagramMuscleGroup) => void;
};

function FrontMuscleDiagram({ selectedMuscleGroup, onSelect }: MuscleDiagramProps) {
  return (
    <svg
      viewBox="0 0 420 620"
      className="mx-auto w-full max-w-[420px] text-white"
      role="img"
      aria-label="Front body muscle diagram"
    >
      <defs>
        <linearGradient id="frontSkin" x1="170" x2="250" y1="42" y2="548" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8d5b8" />
          <stop offset="1" stopColor="#b87549" />
        </linearGradient>
        <linearGradient id="frontMuscle" x1="144" x2="276" y1="138" y2="560" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fdba74" />
          <stop offset="0.45" stopColor="#f97316" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="frontDeepMuscle" x1="138" x2="280" y1="150" y2="558" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="1" stopColor="#9a3412" />
        </linearGradient>
      </defs>

      <text x="210" y="36" textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="700" opacity="0.95">
        FRONT
      </text>

      <ellipse cx="210" cy="82" rx="39" ry="42" fill="url(#frontSkin)" />
      <path d="M190 120 C197 128 223 128 230 120 L234 144 L186 144 Z" fill="#c99068" opacity="0.86" />

      <path
        d="M170 135 C150 139 138 151 132 169 C124 195 122 233 132 263 C139 268 150 267 158 260 C155 230 158 195 169 169 Z"
        fill="#2b1d15"
        opacity="0.72"
      />
      <path
        d="M250 135 C270 139 282 151 288 169 C296 195 298 233 288 263 C281 268 270 267 262 260 C265 230 262 195 251 169 Z"
        fill="#2b1d15"
        opacity="0.72"
      />
      <path
        d="M165 146 C174 135 191 130 210 130 C229 130 246 135 255 146 C264 176 262 247 250 293 C240 306 225 312 210 312 C195 312 180 306 170 293 C158 247 156 176 165 146 Z"
        fill="#2b1d15"
        opacity="0.76"
      />
      <path d="M168 294 C182 307 238 307 252 294 L260 331 C244 345 176 345 160 331 Z" fill="#2b1d15" opacity="0.76" />
      <path d="M170 333 C183 326 202 328 207 342 L205 431 C196 441 178 438 171 423 Z" fill="#2b1d15" opacity="0.8" />
      <path d="M250 333 C237 326 218 328 213 342 L215 431 C224 441 242 438 249 423 Z" fill="#2b1d15" opacity="0.8" />
      <path d="M176 431 C187 425 201 429 207 443 L207 558 C195 566 181 562 174 548 Z" fill="#2b1d15" opacity="0.82" />
      <path d="M244 431 C233 425 219 429 213 443 L213 558 C225 566 239 562 246 548 Z" fill="#2b1d15" opacity="0.82" />

      <path d="M170 140 C151 141 138 153 135 171 C148 176 164 173 174 161 C177 151 177 143 170 140 Z" fill="#fb923c" />
      <path d="M250 140 C269 141 282 153 285 171 C272 176 256 173 246 161 C243 151 243 143 250 140 Z" fill="#fb923c" />
      <path d="M177 151 C187 145 201 145 209 154 L206 199 C196 211 176 204 169 187 C166 170 168 158 177 151 Z" fill="url(#frontMuscle)" />
      <path d="M243 151 C233 145 219 145 211 154 L214 199 C224 211 244 204 251 187 C254 170 252 158 243 151 Z" fill="url(#frontMuscle)" />
      <path d="M136 166 C126 181 124 208 132 228 C144 230 154 219 157 199 C158 180 151 168 136 166 Z" fill="url(#frontDeepMuscle)" />
      <path d="M284 166 C294 181 296 208 288 228 C276 230 266 219 263 199 C262 180 269 168 284 166 Z" fill="url(#frontDeepMuscle)" />
      <path d="M132 230 C123 248 126 276 138 292 C148 289 155 275 154 256 C153 241 146 230 132 230 Z" fill="#9a3412" opacity="0.92" />
      <path d="M288 230 C297 248 294 276 282 292 C272 289 265 275 266 256 C267 241 274 230 288 230 Z" fill="#9a3412" opacity="0.92" />

      <path d="M181 204 C189 199 202 199 208 207 L207 292 C197 300 184 296 178 285 C174 255 174 225 181 204 Z" fill="url(#frontMuscle)" />
      <path d="M239 204 C231 199 218 199 212 207 L213 292 C223 300 236 296 242 285 C246 255 246 225 239 204 Z" fill="url(#frontMuscle)" />
      <path d="M188 218 H206 V245 H188 Z" fill="#fdba74" opacity="0.9" />
      <path d="M214 218 H232 V245 H214 Z" fill="#fdba74" opacity="0.9" />
      <path d="M187 251 H206 V279 H187 Z" fill="#f97316" opacity="0.95" />
      <path d="M214 251 H233 V279 H214 Z" fill="#f97316" opacity="0.95" />
      <path d="M190 285 H206 V305 H190 Z" fill="#ea580c" opacity="0.9" />
      <path d="M214 285 H230 V305 H214 Z" fill="#ea580c" opacity="0.9" />
      <line x1="210" x2="210" y1="206" y2="306" stroke="#7c2d12" strokeLinecap="round" strokeWidth="2" opacity="0.55" />
      <path d="M178 219 C168 242 168 269 178 291" fill="none" stroke="#fdba74" strokeLinecap="round" strokeWidth="3" opacity="0.55" />
      <path d="M242 219 C252 242 252 269 242 291" fill="none" stroke="#fdba74" strokeLinecap="round" strokeWidth="3" opacity="0.55" />

      <path d="M166 333 C182 328 201 334 207 350 L205 428 C195 436 180 433 171 419 C165 393 163 361 166 333 Z" fill="url(#frontDeepMuscle)" />
      <path d="M254 333 C238 328 219 334 213 350 L215 428 C225 436 240 433 249 419 C255 393 257 361 254 333 Z" fill="url(#frontDeepMuscle)" />
      <path d="M177 437 C190 431 202 438 207 454 L207 556 C196 563 182 559 176 545 C171 510 171 470 177 437 Z" fill="#fb923c" />
      <path d="M243 437 C230 431 218 438 213 454 L213 556 C224 563 238 559 244 545 C249 510 249 470 243 437 Z" fill="#fb923c" />
      <path d="M188 438 C181 471 181 518 190 555" fill="none" stroke="#ffedd5" strokeLinecap="round" strokeWidth="2" opacity="0.4" />
      <path d="M232 438 C239 471 239 518 230 555" fill="none" stroke="#ffedd5" strokeLinecap="round" strokeWidth="2" opacity="0.4" />
      <path d="M164 560 C176 552 195 552 208 563 L208 575 L160 575 Z" fill="#2b1d15" opacity="0.8" />
      <path d="M256 560 C244 552 225 552 212 563 L212 575 L260 575 Z" fill="#2b1d15" opacity="0.8" />

      <MuscleLabel
        points="152,150 124,130 94,114"
        x={20}
        y={106}
        muscleGroup="Shoulders"
        isSelected={selectedMuscleGroup === "Shoulders"}
        onSelect={onSelect}
      >
        Shoulders
      </MuscleLabel>
      <MuscleLabel
        points="181,177 268,170 316,164"
        x={324}
        y={168}
        muscleGroup="Chest"
        isSelected={selectedMuscleGroup === "Chest"}
        onSelect={onSelect}
      >
        Chest
      </MuscleLabel>
      <MuscleLabel
        points="138,178 108,183 90,198"
        x={20}
        y={208}
        muscleGroup="Biceps"
        isSelected={selectedMuscleGroup === "Biceps"}
        onSelect={onSelect}
      >
        Biceps
      </MuscleLabel>
      <MuscleLabel
        points="211,252 262,255 308,266"
        x={314}
        y={274}
        muscleGroup="Abs"
        isSelected={selectedMuscleGroup === "Abs"}
        onSelect={onSelect}
      >
        Abs
      </MuscleLabel>
      <MuscleLabel
        points="178,382 136,394 96,414"
        x={20}
        y={426}
        muscleGroup="Quads"
        isSelected={selectedMuscleGroup === "Quads"}
        onSelect={onSelect}
      >
        Quads
      </MuscleLabel>
      <MuscleLabel
        points="182,506 138,518 96,538"
        x={20}
        y={550}
        muscleGroup="Calves"
        isSelected={selectedMuscleGroup === "Calves"}
        onSelect={onSelect}
      >
        Calves
      </MuscleLabel>
    </svg>
  );
}

function BackMuscleDiagram({ selectedMuscleGroup, onSelect }: MuscleDiagramProps) {
  return (
    <svg
      viewBox="0 0 420 620"
      className="mx-auto w-full max-w-[420px] text-white"
      role="img"
      aria-label="Back body muscle diagram"
    >
      <defs>
        <linearGradient id="backSkin" x1="170" x2="250" y1="42" y2="548" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8d5b8" />
          <stop offset="1" stopColor="#b87549" />
        </linearGradient>
        <linearGradient id="backMuscle" x1="142" x2="278" y1="138" y2="560" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fdba74" />
          <stop offset="0.45" stopColor="#f97316" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="backDeepMuscle" x1="140" x2="280" y1="152" y2="562" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="1" stopColor="#9a3412" />
        </linearGradient>
      </defs>

      <text x="210" y="36" textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="700" opacity="0.95">
        BACK
      </text>

      <ellipse cx="210" cy="82" rx="39" ry="42" fill="url(#backSkin)" />
      <path d="M188 120 C197 129 223 129 232 120 L235 146 L185 146 Z" fill="#c99068" opacity="0.88" />

      <path
        d="M169 135 C149 139 137 151 131 170 C123 196 122 234 132 263 C139 268 150 267 158 260 C155 230 158 195 169 169 Z"
        fill="#2b1d15"
        opacity="0.72"
      />
      <path
        d="M251 135 C271 139 283 151 289 170 C297 196 298 234 288 263 C281 268 270 267 262 260 C265 230 262 195 251 169 Z"
        fill="#2b1d15"
        opacity="0.72"
      />
      <path
        d="M165 145 C174 134 191 130 210 130 C229 130 246 134 255 145 C265 181 263 250 250 292 C239 307 225 314 210 314 C195 314 181 307 170 292 C157 250 155 181 165 145 Z"
        fill="#2b1d15"
        opacity="0.76"
      />
      <path d="M168 294 C183 307 237 307 252 294 L260 332 C244 346 176 346 160 332 Z" fill="#2b1d15" opacity="0.78" />
      <path d="M170 333 C183 326 202 328 207 342 L205 432 C195 441 179 438 171 423 Z" fill="#2b1d15" opacity="0.82" />
      <path d="M250 333 C237 326 218 328 213 342 L215 432 C225 441 241 438 249 423 Z" fill="#2b1d15" opacity="0.82" />
      <path d="M176 432 C187 426 201 430 207 444 L207 559 C196 566 181 562 174 548 Z" fill="#2b1d15" opacity="0.84" />
      <path d="M244 432 C233 426 219 430 213 444 L213 559 C224 566 239 562 246 548 Z" fill="#2b1d15" opacity="0.84" />

      <path d="M210 132 C197 145 190 159 189 178 L210 197 L231 178 C230 159 223 145 210 132 Z" fill="#fb923c" />
      <path d="M170 140 C151 142 137 154 134 172 C147 177 165 173 175 160 C178 151 177 143 170 140 Z" fill="#fb923c" />
      <path d="M250 140 C269 142 283 154 286 172 C273 177 255 173 245 160 C242 151 243 143 250 140 Z" fill="#fb923c" />
      <path d="M179 159 C194 159 205 173 209 197 L207 260 C187 251 175 229 171 199 C169 181 172 167 179 159 Z" fill="url(#backMuscle)" />
      <path d="M241 159 C226 159 215 173 211 197 L213 260 C233 251 245 229 249 199 C251 181 248 167 241 159 Z" fill="url(#backMuscle)" />
      <path d="M190 197 C200 204 220 204 230 197 L224 285 C217 293 203 293 196 285 Z" fill="#c2410c" opacity="0.86" />
      <line x1="210" x2="210" y1="150" y2="292" stroke="#7c2d12" strokeLinecap="round" strokeWidth="2" opacity="0.62" />
      <path d="M190 178 C179 205 179 237 194 265" fill="none" stroke="#fed7aa" strokeLinecap="round" strokeWidth="2" opacity="0.42" />
      <path d="M230 178 C241 205 241 237 226 265" fill="none" stroke="#fed7aa" strokeLinecap="round" strokeWidth="2" opacity="0.42" />
      <path d="M136 168 C126 184 124 209 132 230 C145 230 155 218 157 197 C157 180 150 169 136 168 Z" fill="url(#backDeepMuscle)" />
      <path d="M284 168 C294 184 296 209 288 230 C275 230 265 218 263 197 C263 180 270 169 284 168 Z" fill="url(#backDeepMuscle)" />
      <path d="M132 231 C124 249 127 276 138 292 C148 289 155 275 154 256 C153 242 146 231 132 231 Z" fill="#9a3412" opacity="0.92" />
      <path d="M288 231 C296 249 293 276 282 292 C272 289 265 275 266 256 C267 242 274 231 288 231 Z" fill="#9a3412" opacity="0.92" />

      <path d="M171 292 C185 286 204 290 210 305 C208 325 197 341 180 344 C168 337 161 322 164 306 C166 300 168 296 171 292 Z" fill="#ea580c" />
      <path d="M249 292 C235 286 216 290 210 305 C212 325 223 341 240 344 C252 337 259 322 256 306 C254 300 252 296 249 292 Z" fill="#ea580c" />
      <path d="M166 335 C181 329 201 335 207 351 L205 431 C196 439 180 436 171 421 C165 393 163 361 166 335 Z" fill="url(#backDeepMuscle)" />
      <path d="M254 335 C239 329 219 335 213 351 L215 431 C224 439 240 436 249 421 C255 393 257 361 254 335 Z" fill="url(#backDeepMuscle)" />
      <path d="M178 439 C190 432 202 439 207 455 L207 557 C196 563 182 559 176 545 C172 510 172 471 178 439 Z" fill="#fb923c" />
      <path d="M242 439 C230 432 218 439 213 455 L213 557 C224 563 238 559 244 545 C248 510 248 471 242 439 Z" fill="#fb923c" />
      <path d="M188 440 C181 471 181 518 190 555" fill="none" stroke="#ffedd5" strokeLinecap="round" strokeWidth="2" opacity="0.38" />
      <path d="M232 440 C239 471 239 518 230 555" fill="none" stroke="#ffedd5" strokeLinecap="round" strokeWidth="2" opacity="0.38" />
      <path d="M164 560 C176 552 195 552 208 563 L208 575 L160 575 Z" fill="#2b1d15" opacity="0.8" />
      <path d="M256 560 C244 552 225 552 212 563 L212 575 L260 575 Z" fill="#2b1d15" opacity="0.8" />

      <MuscleLabel
        points="210,150 166,132 104,114"
        x={20}
        y={106}
        muscleGroup="Traps"
        isSelected={selectedMuscleGroup === "Traps"}
        onSelect={onSelect}
      >
        Traps
      </MuscleLabel>
      <MuscleLabel
        points="241,190 286,184 324,170"
        x={332}
        y={164}
        muscleGroup="Back"
        isSelected={selectedMuscleGroup === "Back"}
        onSelect={onSelect}
      >
        Back
      </MuscleLabel>
      <MuscleLabel
        points="137,180 110,186 94,202"
        x={20}
        y={212}
        muscleGroup="Triceps"
        isSelected={selectedMuscleGroup === "Triceps"}
        onSelect={onSelect}
      >
        Triceps
      </MuscleLabel>
      <MuscleLabel
        points="228,316 274,323 314,338"
        x={320}
        y={348}
        muscleGroup="Glutes"
        isSelected={selectedMuscleGroup === "Glutes"}
        onSelect={onSelect}
      >
        Glutes
      </MuscleLabel>
      <MuscleLabel
        points="242,388 286,398 324,416"
        x={268}
        y={438}
        muscleGroup="Hamstrings"
        isSelected={selectedMuscleGroup === "Hamstrings"}
        onSelect={onSelect}
      >
        Hamstrings
      </MuscleLabel>
      <MuscleLabel
        points="242,510 286,526 324,546"
        x={300}
        y={566}
        muscleGroup="Calves"
        isSelected={selectedMuscleGroup === "Calves"}
        onSelect={onSelect}
      >
        Calves
      </MuscleLabel>
    </svg>
  );
}

type MuscleExerciseMenuProps = {
  muscleGroup: DiagramMuscleGroup;
  onBack: () => void;
};

function MuscleExerciseMenu({ muscleGroup, onBack }: MuscleExerciseMenuProps) {
  const associatedExercises = getExercisesForMuscleGroup(muscleGroup);

  return (
    <div className="muscle-exercise-menu mt-4 overflow-hidden rounded-2xl border border-emerald-400/30 bg-neutral-950/90 shadow-lg">
      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center gap-2 border-b border-neutral-800 px-4 py-3 text-left text-sm font-semibold text-emerald-200 transition-colors hover:bg-neutral-900"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M9 14 4 9l5-5" />
          <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
        </svg>
        Back
      </button>

      <div className="px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {muscleGroup} exercises
        </p>
        <ul className="mt-3 space-y-2">
          {associatedExercises.map((exercise) => (
            <li
              key={exercise}
              className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100"
            >
              {exercise}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function BodybuildingDiagramPage() {
  const [sharedState, setSharedState] = useState<SharedAppState>(DEFAULT_SHARED_STATE);
  const [activeSelection, setActiveSelection] = useState<ActiveMuscleSelection | null>(null);
  const frontDiagramRef = useRef<HTMLDivElement>(null);
  const backDiagramRef = useRef<HTMLDivElement>(null);
  const frontMenuRef = useRef<HTMLDivElement>(null);
  const backMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    void loadSharedState().then((state) => {
      if (active && state) {
        setSharedState(state);
      }
    });

    const unsubscribe = subscribeToSharedState((state) => {
      setSharedState(state);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const currentWorkoutProgressPercent = getCurrentWorkoutProgressPercent(
    sharedState.workout,
    sharedState.completedExercises
  );
  const fullBodyProgressPercent = getFullBodyAndStretchProgressPercent(sharedState);
  const selectedFrontMuscleGroup =
    activeSelection?.side === "front" ? activeSelection.muscleGroup : null;
  const selectedBackMuscleGroup =
    activeSelection?.side === "back" ? activeSelection.muscleGroup : null;

  useEffect(() => {
    if (!activeSelection) {
      return;
    }

    const menuElement =
      activeSelection.side === "front" ? frontMenuRef.current : backMenuRef.current;

    window.requestAnimationFrame(() => {
      menuElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [activeSelection]);

  const closeExerciseMenu = (side: DiagramSide) => {
    const diagramElement = side === "front" ? frontDiagramRef.current : backDiagramRef.current;

    setActiveSelection(null);
    window.requestAnimationFrame(() => {
      diagramElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
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

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div ref={frontDiagramRef} className="rounded-2xl bg-neutral-950/80 p-4">
              <FrontMuscleDiagram
                selectedMuscleGroup={selectedFrontMuscleGroup}
                onSelect={(muscleGroup) => setActiveSelection({ side: "front", muscleGroup })}
              />
            </div>
            {selectedFrontMuscleGroup && (
              <div ref={frontMenuRef}>
                <MuscleExerciseMenu
                  muscleGroup={selectedFrontMuscleGroup}
                  onBack={() => closeExerciseMenu("front")}
                />
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div ref={backDiagramRef} className="rounded-2xl bg-neutral-950/80 p-4">
              <BackMuscleDiagram
                selectedMuscleGroup={selectedBackMuscleGroup}
                onSelect={(muscleGroup) => setActiveSelection({ side: "back", muscleGroup })}
              />
            </div>
            {selectedBackMuscleGroup && (
              <div ref={backMenuRef}>
                <MuscleExerciseMenu
                  muscleGroup={selectedBackMuscleGroup}
                  onBack={() => closeExerciseMenu("back")}
                />
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

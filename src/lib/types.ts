export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // kg
  rest: number; // segundos
};

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export type SessionSet = { reps: number; weight: number; done: boolean };

export type SessionEntry = {
  exerciseId: string;
  name: string;
  sets: SessionSet[];
};

export type Session = {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string; // AAAA-MM-DD
  entries: SessionEntry[];
};

export type BodyEntry = {
  id: string;
  date: string; // AAAA-MM-DD
  weight: number;
  waist?: number;
  hip?: number;
  arm?: number;
  thigh?: number;
};

export type Reminder = {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  /** 1 = domingo ... 7 = sábado. Vazio = todos os dias. */
  weekdays: number[];
  enabled: boolean;
};

export type AppState = {
  version: 1;
  workouts: Workout[];
  sessions: Session[];
  body: BodyEntry[];
  water: Record<string, number>; // data -> copos
  waterGoal: number; // copos por dia
  cupMl: number;
  meals: string[];
  mealsDone: Record<string, string[]>; // data -> refeições feitas
  reminders: Reminder[];
};

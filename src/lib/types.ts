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

/** Valores nutricionais referentes a `baseGrams` gramas do alimento. */
export type Nutrients = {
  kcal: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type Portion = { label: string; grams: number };

export type Food = Nutrients & {
  id: string;
  name: string;
  baseGrams: number;
  category?: string;
  portions?: Portion[];
  custom?: boolean;
};

/** Registro de algo que foi comido. Os valores ficam copiados (não mudam se o alimento for editado). */
export type FoodLogEntry = {
  id: string;
  date: string; // AAAA-MM-DD
  meal: string;
  foodId: string;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Sex = 'f' | 'm';
export type Goal = 'perder' | 'manter' | 'ganhar';

export type Profile = {
  configured: boolean;
  name: string;
  sex: Sex;
  age: number;
  height: number; // cm
  weight: number; // kg (usado se não houver registro em Evolução)
  activity: number; // fator de atividade (1.2 a 1.9)
  goal: Goal;
  kcalOverride: number | null; // meta manual de calorias
  waterOverride: number | null; // meta manual de copos
};

export type Fast = {
  id: string;
  start: number; // timestamp (ms)
  end: number; // timestamp (ms)
  targetHours: number;
};

export type FastingState = {
  protocolHours: number;
  active: { start: number; targetHours: number } | null;
  history: Fast[];
};

export type AppState = {
  version: 1;
  workouts: Workout[];
  sessions: Session[];
  body: BodyEntry[];
  water: Record<string, number>; // data -> copos
  waterGoal: number; // copos por dia (legado; hoje vem do perfil)
  cupMl: number;
  meals: string[];
  mealsDone: Record<string, string[]>; // legado
  reminders: Reminder[];
  profile: Profile;
  foods: Food[]; // alimentos criados/editados pela usuária
  foodLog: FoodLogEntry[];
  recentFoodIds: string[];
  fasting: FastingState;
};

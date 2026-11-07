import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import type { AppState } from './types';
import { uid } from './utils';

const STORAGE_KEY = 'meufit:state:v1';

export function defaultState(): AppState {
  return {
    version: 1,
    workouts: [
      {
        id: uid(),
        name: 'Treino A – Inferiores',
        exercises: [
          { id: uid(), name: 'Agachamento livre', sets: 4, reps: 12, weight: 20, rest: 90 },
          { id: uid(), name: 'Leg press 45°', sets: 4, reps: 12, weight: 80, rest: 90 },
          { id: uid(), name: 'Cadeira extensora', sets: 3, reps: 15, weight: 30, rest: 60 },
          { id: uid(), name: 'Elevação pélvica', sets: 4, reps: 12, weight: 40, rest: 60 },
        ],
      },
      {
        id: uid(),
        name: 'Treino B – Superiores',
        exercises: [
          { id: uid(), name: 'Puxada frontal', sets: 4, reps: 12, weight: 30, rest: 60 },
          { id: uid(), name: 'Supino com halteres', sets: 3, reps: 12, weight: 8, rest: 60 },
          { id: uid(), name: 'Desenvolvimento', sets: 3, reps: 12, weight: 6, rest: 60 },
          { id: uid(), name: 'Rosca direta', sets: 3, reps: 12, weight: 5, rest: 45 },
        ],
      },
    ],
    sessions: [],
    body: [],
    water: {},
    waterGoal: 8,
    cupMl: 250,
    meals: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'],
    mealsDone: {},
    reminders: [],
    profile: {
      configured: false,
      name: '',
      sex: 'f',
      age: 30,
      height: 165,
      weight: 65,
      activity: 1.375,
      goal: 'manter',
      kcalOverride: null,
      waterOverride: null,
    },
    foods: [],
    foodLog: [],
    recentFoodIds: [],
    fasting: { protocolHours: 12, active: null, history: [] },
  };
}

/** Garante que um estado importado/antigo tenha todos os campos. */
export function normalizeState(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  return {
    version: 1,
    workouts: Array.isArray(r.workouts) ? r.workouts : base.workouts,
    sessions: Array.isArray(r.sessions) ? r.sessions : [],
    body: Array.isArray(r.body) ? r.body : [],
    water: r.water && typeof r.water === 'object' ? r.water : {},
    waterGoal: typeof r.waterGoal === 'number' ? r.waterGoal : base.waterGoal,
    cupMl: typeof r.cupMl === 'number' ? r.cupMl : base.cupMl,
    meals: Array.isArray(r.meals) && r.meals.length ? r.meals : base.meals,
    mealsDone: r.mealsDone && typeof r.mealsDone === 'object' ? r.mealsDone : {},
    reminders: Array.isArray(r.reminders) ? r.reminders : [],
    profile: r.profile && typeof r.profile === 'object' ? { ...base.profile, ...r.profile } : base.profile,
    foods: Array.isArray(r.foods) ? r.foods : [],
    foodLog: Array.isArray(r.foodLog) ? r.foodLog : [],
    recentFoodIds: Array.isArray(r.recentFoodIds) ? r.recentFoodIds : [],
    fasting:
      r.fasting && typeof r.fasting === 'object'
        ? {
            protocolHours: typeof r.fasting.protocolHours === 'number' ? r.fasting.protocolHours : 12,
            active: r.fasting.active ?? null,
            history: Array.isArray(r.fasting.history) ? r.fasting.history : [],
          }
        : base.fasting,
  };
}

type StoreValue = {
  state: AppState;
  ready: boolean;
  update: (fn: (s: AppState) => AppState) => void;
  replace: (s: AppState) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) setState(normalizeState(JSON.parse(json)));
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);
  const replace = useCallback((s: AppState) => setState(normalizeState(s)), []);

  return <StoreContext.Provider value={{ state, ready, update, replace }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore precisa estar dentro de StoreProvider');
  return ctx;
}

import type { AppState, Goal } from './types';

export const ACTIVITY_LEVELS: { value: number; label: string; hint: string }[] = [
  { value: 1.2, label: 'Sedentária', hint: 'Pouco ou nenhum exercício' },
  { value: 1.375, label: 'Leve', hint: 'Exercício 1 a 3x por semana' },
  { value: 1.55, label: 'Moderada', hint: 'Exercício 3 a 5x por semana' },
  { value: 1.725, label: 'Alta', hint: 'Exercício 6 a 7x por semana' },
  { value: 1.9, label: 'Muito alta', hint: 'Treino intenso diário ou trabalho físico' },
];

export const GOALS: { value: Goal; label: string }[] = [
  { value: 'perder', label: 'Emagrecer' },
  { value: 'manter', label: 'Manter' },
  { value: 'ganhar', label: 'Ganhar massa' },
];

export const MIN_KCAL = 1200;

/** Peso mais recente: último registro em Evolução ou o peso do perfil. */
export function currentWeight(state: AppState) {
  const last = [...state.body].sort((a, b) => b.date.localeCompare(a.date))[0];
  return last?.weight ?? state.profile.weight;
}

/** Taxa metabólica basal (Mifflin-St Jeor). */
export function bmr(state: AppState) {
  const p = state.profile;
  const w = currentWeight(state);
  return 10 * w + 6.25 * p.height - 5 * p.age + (p.sex === 'f' ? -161 : 5);
}

export function computeTargets(state: AppState) {
  const p = state.profile;
  const weight = currentWeight(state);
  const basal = bmr(state);
  const maintenance = basal * p.activity;
  const factor = p.goal === 'perder' ? 0.8 : p.goal === 'ganhar' ? 1.1 : 1;
  const autoKcal = Math.max(MIN_KCAL, Math.round((maintenance * factor) / 10) * 10);
  const kcal = p.kcalOverride && p.kcalOverride > 0 ? p.kcalOverride : autoKcal;

  // Macros: proteína por kg, gordura ~25% das calorias, o resto em carboidratos
  const proteinPerKg = p.goal === 'manter' ? 1.6 : 1.8;
  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));

  // Água: 35 ml por kg de peso
  const waterMl = Math.round(weight * 35);
  const autoCups = Math.max(1, Math.ceil(waterMl / state.cupMl));
  const cups = p.waterOverride && p.waterOverride > 0 ? p.waterOverride : autoCups;

  return {
    weight,
    basal: Math.round(basal),
    maintenance: Math.round(maintenance),
    autoKcal,
    kcal,
    protein,
    fat,
    carbs,
    waterMl,
    autoCups,
    cups,
  };
}

export function bmi(state: AppState) {
  const h = state.profile.height / 100;
  if (!h) return 0;
  return currentWeight(state) / (h * h);
}

export function bmiLabel(v: number) {
  if (v < 18.5) return 'Abaixo do peso';
  if (v < 25) return 'Peso adequado';
  if (v < 30) return 'Sobrepeso';
  return 'Obesidade';
}

import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Check, ProgressBar, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { currentWeekKeys, dateKey, formatNumber, WEEKDAYS_SHORT } from '@/lib/utils';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Hoje() {
  const c = useColors();
  const { state, update } = useStore();
  const today = dateKey();

  const cups = state.water[today] ?? 0;
  const mealsDone = state.mealsDone[today] ?? [];
  const week = currentWeekKeys();
  const trainedDays = new Set(state.sessions.map((s) => s.date));
  const trainedThisWeek = week.filter((d) => trainedDays.has(d)).length;
  const lastBody = [...state.body].sort((a, b) => b.date.localeCompare(a.date))[0];

  const setCups = (n: number) =>
    update((s) => ({ ...s, water: { ...s.water, [today]: Math.max(0, n) } }));

  const toggleMeal = (meal: string) =>
    update((s) => {
      const done = s.mealsDone[today] ?? [];
      const next = done.includes(meal) ? done.filter((m) => m !== meal) : [...done, meal];
      return { ...s, mealsDone: { ...s.mealsDone, [today]: next } };
    });

  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen>
      <View>
        <T kind="muted" style={{ textTransform: 'capitalize' }}>{dateLabel}</T>
        <T kind="title">{greeting()}! ✨</T>
      </View>

      {/* Semana */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">Sua semana</T>
          <T kind="muted">{trainedThisWeek} {trainedThisWeek === 1 ? 'treino' : 'treinos'}</T>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          {week.map((d, i) => {
            const done = trainedDays.has(d);
            const isToday = d === today;
            return (
              <View key={d} style={{ alignItems: 'center', gap: 6 }}>
                <T kind="small">{WEEKDAYS_SHORT[i]}</T>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: done ? c.accent : c.background,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: c.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <T kind="small" color={done ? c.onAccent : c.textSecondary}>{done ? '✓' : d.slice(8)}</T>
                </View>
              </View>
            );
          })}
        </Row>
        <Button title="Começar treino" onPress={() => router.navigate('/treinos')} />
      </Card>

      {/* Água */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">💧 Água</T>
          <T kind="muted">
            {formatNumber((cups * state.cupMl) / 1000)} L de {formatNumber((state.waterGoal * state.cupMl) / 1000)} L
          </T>
        </Row>
        <ProgressBar value={cups / state.waterGoal} color={c.water} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Button title="−" variant="soft" small onPress={() => setCups(cups - 1)} style={{ width: 56 }} />
          <T kind="big" color={c.water}>
            {cups}/{state.waterGoal}
          </T>
          <Button title={`+ copo`} small onPress={() => setCups(cups + 1)} style={{ backgroundColor: c.water }} />
        </Row>
        {cups >= state.waterGoal ? <T kind="muted">Meta do dia batida! 🎉</T> : null}
      </Card>

      {/* Refeições */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">🍽️ Refeições</T>
          <T kind="muted">
            {mealsDone.length}/{state.meals.length}
          </T>
        </Row>
        {state.meals.map((m) => (
          <Check key={m} label={m} checked={mealsDone.includes(m)} onPress={() => toggleMeal(m)} />
        ))}
      </Card>

      {/* Peso */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">⚖️ Peso</T>
          <Button title="Registrar" variant="ghost" small onPress={() => router.navigate('/evolucao')} />
        </Row>
        {lastBody ? (
          <T kind="big">{formatNumber(lastBody.weight)} kg</T>
        ) : (
          <T kind="muted">Nenhum registro ainda.</T>
        )}
      </Card>
    </Screen>
  );
}

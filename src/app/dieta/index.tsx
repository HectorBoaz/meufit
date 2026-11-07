import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { CalorieSummary } from '@/components/macro-bars';
import { Button, Card, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { sumEntries } from '@/lib/foods';
import { useToday } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import { computeTargets } from '@/lib/targets';
import type { FoodLogEntry } from '@/lib/types';
import { dateKey, formatDate, formatNumber } from '@/lib/utils';

function shiftDate(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

function dayLabel(key: string, today: string) {
  if (key === today) return 'Hoje';
  if (key === shiftDate(today, -1)) return 'Ontem';
  return formatDate(key);
}

export default function Dieta() {
  const c = useColors();
  const { state, update } = useStore();
  const today = useToday();
  const [picked, setPicked] = useState<string | null>(null);
  const date = picked ?? today;
  const targets = computeTargets(state);

  const entries = state.foodLog.filter((e) => e.date === date);
  const totals = sumEntries(entries);

  // Últimos 7 dias
  const week = Array.from({ length: 7 }, (_, i) => shiftDate(today, i - 6));
  const weekKcal = week.map((d) => sumEntries(state.foodLog.filter((e) => e.date === d)).kcal);
  const maxKcal = Math.max(targets.kcal, ...weekKcal) || 1;
  const logged = weekKcal.filter((k) => k > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, b) => a + b, 0) / logged.length) : 0;

  // Refeições configuradas + qualquer refeição antiga que tenha registros
  const meals = [...state.meals, ...new Set(entries.map((e) => e.meal).filter((m) => !state.meals.includes(m)))];

  const openEntry = (e: FoodLogEntry) =>
    Alert.alert(e.name, `${formatNumber(e.grams)} g · ${e.kcal} kcal`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Editar quantidade',
        onPress: () => router.push({ pathname: '/dieta/adicionar', params: { entryId: e.id } }),
      },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => update((s) => ({ ...s, foodLog: s.foodLog.filter((x) => x.id !== e.id) })),
      },
    ]);

  return (
    <Screen>
      {/* Navegação por dia */}
      <Row style={{ justifyContent: 'space-between' }}>
        <Button title="‹" variant="soft" small onPress={() => setPicked(shiftDate(date, -1))} style={{ width: 44 }} />
        <Pressable onPress={() => setPicked(null)}>
          <T kind="heading">{dayLabel(date, today)}</T>
        </Pressable>
        <Button
          title="›"
          variant="soft"
          small
          disabled={date >= today}
          onPress={() => {
            const next = shiftDate(date, 1);
            setPicked(next >= today ? null : next);
          }}
          style={{ width: 44 }}
        />
      </Row>

      {!state.profile.configured ? (
        <Card style={{ backgroundColor: c.accentSoft }}>
          <T kind="heading">Defina sua meta de calorias</T>
          <T kind="muted">
            Preencha seu perfil (idade, altura, peso e objetivo) para o app calcular quantas calorias você precisa por
            dia. Por enquanto estou usando uma estimativa.
          </T>
          <Button title="Preencher perfil" onPress={() => router.navigate('/mais/perfil')} />
        </Card>
      ) : null}

      <Card>
        <CalorieSummary totals={totals} targets={targets} />
      </Card>

      {meals.map((meal) => {
        const items = entries.filter((e) => e.meal === meal);
        const mealKcal = items.reduce((s, e) => s + e.kcal, 0);
        return (
          <Card key={meal} style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T kind="heading">{meal}</T>
              <T kind="muted">{mealKcal} kcal</T>
            </Row>
            {items.map((e) => (
              <Pressable key={e.id} onPress={() => openEntry(e)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Row style={{ justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.border }}>
                  <View style={{ flex: 1 }}>
                    <T>{e.name}</T>
                    <T kind="small">
                      {formatNumber(e.grams)} g · P {formatNumber(e.protein)} · C {formatNumber(e.carbs)} · G {formatNumber(e.fat)}
                    </T>
                  </View>
                  <T style={{ fontWeight: '700' }}>{e.kcal}</T>
                </Row>
              </Pressable>
            ))}
            <Button
              title="+ Adicionar"
              variant="ghost"
              small
              onPress={() => router.push({ pathname: '/dieta/adicionar', params: { meal, date } })}
            />
          </Card>
        );
      })}

      {/* Semana */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">Últimos 7 dias</T>
          {avg ? <T kind="muted">média {avg} kcal</T> : null}
        </Row>
        <Row style={{ alignItems: 'flex-end', height: 120, gap: 6 }}>
          {week.map((d, i) => {
            const k = weekKcal[i];
            const h = Math.max(4, (k / maxKcal) * 100);
            const over = k > targets.kcal;
            return (
              <Pressable key={d} style={{ flex: 1, alignItems: 'center', gap: 4 }} onPress={() => setPicked(d === today ? null : d)}>
                <T kind="small" style={{ fontSize: 10 }}>{k || ''}</T>
                <View
                  style={{
                    width: '100%',
                    height: h,
                    borderRadius: 6,
                    backgroundColor: k === 0 ? c.border : over ? c.danger : c.accent,
                    opacity: d === date ? 1 : 0.6,
                  }}
                />
                <T kind="small" style={{ fontSize: 10 }}>{d.slice(8)}</T>
              </Pressable>
            );
          })}
        </Row>
        <T kind="small">Meta: {targets.kcal} kcal/dia. Toque numa barra para ver o dia.</T>
      </Card>
    </Screen>
  );
}

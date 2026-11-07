import { router } from 'expo-router';
import { View } from 'react-native';

import { CalorieSummary } from '@/components/macro-bars';
import { Button, Card, ProgressBar, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { formatClock, formatDuration, hoursToMs } from '@/lib/fasting';
import { sumEntries } from '@/lib/foods';
import { useNow, useToday } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import { computeTargets } from '@/lib/targets';
import { currentWeekKeys, formatNumber, WEEKDAYS_SHORT } from '@/lib/utils';

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Hoje() {
  const c = useColors();
  const { state, update } = useStore();
  const today = useToday();
  const active = state.fasting.active;
  const now = useNow(true, active ? 1000 : 60000);
  const t = computeTargets(state);

  const cups = state.water[today] ?? 0;
  const totals = sumEntries(state.foodLog.filter((e) => e.date === today));
  // `today` entra como dependência para a semana mudar junto com o dia
  const week = currentWeekKeys(today);
  const trainedDays = new Set(state.sessions.map((s) => s.date));
  const trainedThisWeek = week.filter((d) => trainedDays.has(d)).length;

  const setCups = (n: number) => update((s) => ({ ...s, water: { ...s.water, [today]: Math.max(0, n) } }));

  const [y, m, d] = today.split('-').map(Number);
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const name = state.profile.name.trim().split(' ')[0];

  // Jejum
  const elapsed = active ? now - active.start : 0;
  const target = active ? hoursToMs(active.targetHours) : 0;

  return (
    <Screen>
      <View>
        <T kind="muted" style={{ textTransform: 'capitalize' }}>{dateLabel}</T>
        <T kind="title">
          {greeting(new Date(now).getHours())}
          {name ? `, ${name}` : ''}! ✨
        </T>
      </View>

      {!state.profile.configured ? (
        <Card style={{ backgroundColor: c.accentSoft }}>
          <T kind="heading">Vamos personalizar? 💕</T>
          <T kind="muted">Preencha seu perfil para eu calcular suas calorias e quanta água você precisa por dia.</T>
          <Button title="Preencher perfil" onPress={() => router.navigate('/mais/perfil')} />
        </Card>
      ) : null}

      {/* Calorias */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">🍽️ Calorias</T>
          <Button title="Registrar" variant="ghost" small onPress={() => router.navigate('/dieta')} />
        </Row>
        <CalorieSummary totals={totals} targets={t} />
      </Card>

      {/* Água */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">💧 Água</T>
          <T kind="muted">
            {formatNumber(Math.round((cups * state.cupMl) / 100) / 10)} L de{' '}
            {formatNumber(Math.round((t.cups * state.cupMl) / 100) / 10)} L
          </T>
        </Row>
        <ProgressBar value={cups / t.cups} color={c.water} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Button title="−" variant="soft" small onPress={() => setCups(cups - 1)} style={{ width: 56 }} />
          <T kind="big" color={c.water}>
            {cups}/{t.cups}
          </T>
          <Button title="+ copo" small onPress={() => setCups(cups + 1)} style={{ backgroundColor: c.water }} />
        </Row>
        <T kind="small">
          {cups >= t.cups
            ? 'Meta do dia batida! 🎉'
            : `Faltam ${t.cups - cups} ${t.cups - cups === 1 ? 'copo' : 'copos'} de ${state.cupMl} ml`}
        </T>
      </Card>

      {/* Jejum */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">⏱️ Jejum</T>
          <Button title={active ? 'Ver' : 'Iniciar'} variant="ghost" small onPress={() => router.navigate('/jejum')} />
        </Row>
        {active ? (
          <>
            <T kind="big" color={elapsed >= target ? c.success : c.accent}>
              {formatDuration(elapsed, true)}
            </T>
            <ProgressBar value={elapsed / target} color={elapsed >= target ? c.success : c.accent} />
            <T kind="small">
              {elapsed >= target
                ? `Meta de ${active.targetHours}h batida! Encerre quando for comer.`
                : `Meta de ${active.targetHours}h · termina ${formatClock(active.start + target, now)}`}
            </T>
          </>
        ) : (
          <T kind="muted">Nenhum jejum em andamento · meta escolhida: {state.fasting.protocolHours}h</T>
        )}
      </Card>

      {/* Semana de treinos */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">🏋️ Treinos da semana</T>
          <T kind="muted">
            {trainedThisWeek} {trainedThisWeek === 1 ? 'treino' : 'treinos'}
          </T>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          {week.map((day, i) => {
            const done = trainedDays.has(day);
            const isToday = day === today;
            return (
              <View key={day} style={{ alignItems: 'center', gap: 6 }}>
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
                  <T kind="small" color={done ? c.onAccent : c.textSecondary}>
                    {done ? '✓' : day.slice(8)}
                  </T>
                </View>
              </View>
            );
          })}
        </Row>
        <Button title="Começar treino" onPress={() => router.navigate('/treinos')} />
      </Card>

      {/* Peso */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="heading">⚖️ Peso</T>
          <Button title="Registrar" variant="ghost" small onPress={() => router.navigate('/mais/evolucao')} />
        </Row>
        {state.body.length ? (
          <T kind="big">{formatNumber(t.weight)} kg</T>
        ) : (
          <T kind="muted">Nenhum registro ainda.</T>
        )}
      </Card>
    </Screen>
  );
}

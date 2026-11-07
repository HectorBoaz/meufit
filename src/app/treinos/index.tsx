import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Card, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function TreinosLista() {
  const c = useColors();
  const { state } = useStore();

  const lastDate = (workoutId: string) =>
    state.sessions
      .filter((s) => s.workoutId === workoutId)
      .map((s) => s.date)
      .sort()
      .pop();

  const recent = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  return (
    <Screen>
      {state.workouts.map((w) => {
        const last = lastDate(w.id);
        return (
          <Card key={w.id}>
            <Pressable onPress={() => router.push({ pathname: '/treinos/[id]', params: { id: w.id } })}>
              <T kind="heading">{w.name}</T>
              <T kind="muted">
                {w.exercises.length} exercícios{last ? ` · último: ${formatDate(last)}` : ''}
              </T>
            </Pressable>
            <Row>
              <Button
                title="▶ Iniciar"
                style={{ flex: 1 }}
                onPress={() => router.push({ pathname: '/treinos/[id]', params: { id: w.id } })}
              />
              <Button
                title="Editar"
                variant="soft"
                onPress={() => router.push({ pathname: '/treinos/editar', params: { id: w.id } })}
              />
            </Row>
          </Card>
        );
      })}

      <Button title="+ Novo treino" variant="soft" onPress={() => router.push('/treinos/editar')} />

      {recent.length > 0 ? (
        <View style={{ gap: 8 }}>
          <T kind="heading">Histórico</T>
          <Card style={{ gap: 0, paddingVertical: 4 }}>
            {recent.map((s, i) => {
              const sets = s.entries.flatMap((e) => e.sets).filter((x) => x.done);
              const volume = sets.reduce((sum, x) => sum + x.reps * x.weight, 0);
              return (
                <Row
                  key={s.id}
                  style={{
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: c.border,
                  }}>
                  <View style={{ flex: 1 }}>
                    <T>{s.workoutName}</T>
                    <T kind="small">
                      {sets.length} séries · {Math.round(volume)} kg de volume
                    </T>
                  </View>
                  <T kind="muted">{formatDate(s.date)}</T>
                </Row>
              );
            })}
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

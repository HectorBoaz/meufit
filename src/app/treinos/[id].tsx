import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { cancelRestEnd, ensurePermission, scheduleRestEnd } from '@/lib/notifications';
import { useStore } from '@/lib/store';
import type { SessionEntry } from '@/lib/types';
import { dateKey, formatNumber, formatSeconds, parseNumber, uid } from '@/lib/utils';

type SetDraft = { reps: string; weight: string; done: boolean };

export default function ExecutarTreino() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, update } = useStore();
  const workout = state.workouts.find((w) => w.id === id);

  const lastSession = [...state.sessions]
    .filter((s) => s.workoutId === id)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const [sets, setSets] = useState<Record<string, SetDraft[]>>(() =>
    Object.fromEntries(
      (workout?.exercises ?? []).map((e) => [
        e.id,
        Array.from({ length: e.sets }, () => ({
          reps: String(e.reps),
          weight: formatNumber(e.weight),
          done: false,
        })),
      ]),
    ),
  );

  // Cronômetro de descanso
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!restEnd) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= restEnd) setRestEnd(null);
    }, 250);
    return () => clearInterval(t);
  }, [restEnd]);
  const remaining = restEnd ? Math.max(0, Math.ceil((restEnd - now) / 1000)) : 0;
  useEffect(() => () => void cancelRestEnd(), []);

  if (!workout) {
    return (
      <Screen>
        <T>Treino não encontrado.</T>
      </Screen>
    );
  }

  const startRest = async (seconds: number) => {
    setNow(Date.now());
    setRestEnd(Date.now() + seconds * 1000);
    if (await ensurePermission()) await scheduleRestEnd(seconds);
  };

  const stopRest = () => {
    setRestEnd(null);
    cancelRestEnd();
  };

  const patchSet = (exId: string, index: number, patch: Partial<SetDraft>) =>
    setSets((all) => ({
      ...all,
      [exId]: all[exId].map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const toggleDone = (exId: string, index: number, rest: number) => {
    const wasDone = sets[exId][index].done;
    patchSet(exId, index, { done: !wasDone });
    if (!wasDone) startRest(rest);
  };

  const totalSets = Object.values(sets).flat().length;
  const doneSets = Object.values(sets).flat().filter((s) => s.done).length;

  const finish = () => {
    if (doneSets === 0) {
      Alert.alert('Nenhuma série marcada', 'Marque as séries que você fez antes de concluir.');
      return;
    }
    const entries: SessionEntry[] = workout.exercises.map((e) => ({
      exerciseId: e.id,
      name: e.name,
      sets: (sets[e.id] ?? []).map((s) => ({ reps: parseNumber(s.reps), weight: parseNumber(s.weight), done: s.done })),
    }));
    update((s) => ({
      ...s,
      sessions: [
        ...s.sessions,
        { id: uid(), workoutId: workout.id, workoutName: workout.name, date: dateKey(), entries },
      ],
      // Atualiza a carga/reps padrão com o que foi usado na última série feita
      workouts: s.workouts.map((w) =>
        w.id !== workout.id
          ? w
          : {
              ...w,
              exercises: w.exercises.map((e) => {
                const done = entries.find((en) => en.exerciseId === e.id)?.sets.filter((x) => x.done) ?? [];
                const last = done[done.length - 1];
                return last ? { ...e, weight: last.weight, reps: last.reps } : e;
              }),
            },
      ),
    }));
    stopRest();
    Alert.alert('Treino concluído! 🎉', `${doneSets} séries registradas. Mandou bem!`);
    router.back();
  };

  const inputStyle = {
    backgroundColor: c.background,
    color: c.text,
    borderRadius: 8,
    paddingVertical: 8,
    width: 64,
    textAlign: 'center' as const,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  };

  return (
    <>
      <Stack.Screen options={{ title: workout.name }} />
      <Screen>
        {restEnd ? (
          <Card style={{ backgroundColor: c.accentSoft, alignItems: 'center' }}>
            <T kind="muted" color={c.accent}>Descansando</T>
            <T kind="big" color={c.accent} style={{ fontSize: 48 }}>{formatSeconds(remaining)}</T>
            <Row>
              <Button title="+15s" variant="ghost" small onPress={() => restEnd && startRest(remaining + 15)} />
              <Button title="Pular" small onPress={stopRest} />
            </Row>
          </Card>
        ) : null}

        <T kind="muted">
          {doneSets}/{totalSets} séries feitas
        </T>

        {workout.exercises.map((e) => {
          const prev = lastSession?.entries.find((en) => en.exerciseId === e.id);
          const prevDone = prev?.sets.filter((s) => s.done) ?? [];
          return (
            <Card key={e.id}>
              <View>
                <T kind="heading">{e.name}</T>
                <T kind="small">
                  Descanso {e.rest}s
                  {prevDone.length
                    ? ` · última vez: ${prevDone.map((s) => `${s.reps}×${formatNumber(s.weight)}kg`).join(', ')}`
                    : ''}
                </T>
              </View>
              <Row style={{ paddingHorizontal: 4 }}>
                <T kind="small" style={{ width: 40 }}>Série</T>
                <T kind="small" style={{ width: 64, textAlign: 'center' }}>Reps</T>
                <T kind="small" style={{ width: 64, textAlign: 'center' }}>kg</T>
              </Row>
              {(sets[e.id] ?? []).map((s, i) => (
                <Row key={i} style={{ opacity: s.done ? 0.55 : 1 }}>
                  <T style={{ width: 40, fontWeight: '700' }}>{i + 1}</T>
                  <TextInput
                    style={inputStyle}
                    keyboardType="number-pad"
                    value={s.reps}
                    onChangeText={(reps) => patchSet(e.id, i, { reps })}
                  />
                  <TextInput
                    style={inputStyle}
                    keyboardType="decimal-pad"
                    value={s.weight}
                    onChangeText={(weight) => patchSet(e.id, i, { weight })}
                  />
                  <View style={{ flex: 1 }} />
                  <Pressable
                    onPress={() => toggleDone(e.id, i, e.rest)}
                    hitSlop={8}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: s.done ? c.success : c.background,
                      borderWidth: s.done ? 0 : 2,
                      borderColor: c.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <T color={s.done ? '#fff' : c.textSecondary} style={{ fontWeight: '900', fontSize: 20 }}>
                      ✓
                    </T>
                  </Pressable>
                </Row>
              ))}
              <Button
                title="+ série"
                variant="ghost"
                small
                onPress={() =>
                  setSets((all) => {
                    const list = all[e.id] ?? [];
                    const last = list[list.length - 1];
                    return {
                      ...all,
                      [e.id]: [
                        ...list,
                        { reps: last?.reps ?? String(e.reps), weight: last?.weight ?? formatNumber(e.weight), done: false },
                      ],
                    };
                  })
                }
              />
            </Card>
          );
        })}

        <Button title="Concluir treino" onPress={finish} />
      </Screen>
    </>
  );
}

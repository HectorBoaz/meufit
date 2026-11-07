import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Card, Input, Row, Screen, Stepper, T } from '@/components/ui';
import { useStore } from '@/lib/store';
import type { Exercise, Workout } from '@/lib/types';
import { formatNumber, parseNumber, uid } from '@/lib/utils';

export default function EditarTreino() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, update } = useStore();
  const existing = state.workouts.find((w) => w.id === id);

  const [draft, setDraft] = useState<Workout>(
    () => existing ?? { id: uid(), name: '', exercises: [] },
  );
  const [weightText, setWeightText] = useState<Record<string, string>>(() =>
    Object.fromEntries(draft.exercises.map((e) => [e.id, formatNumber(e.weight)])),
  );

  const setExercise = (exId: string, patch: Partial<Exercise>) =>
    setDraft((d) => ({ ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) }));

  const addExercise = () => {
    const ex: Exercise = { id: uid(), name: '', sets: 3, reps: 12, weight: 0, rest: 60 };
    setDraft((d) => ({ ...d, exercises: [...d.exercises, ex] }));
    setWeightText((w) => ({ ...w, [ex.id]: '0' }));
  };

  const move = (index: number, dir: -1 | 1) =>
    setDraft((d) => {
      const list = [...d.exercises];
      const target = index + dir;
      if (target < 0 || target >= list.length) return d;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...d, exercises: list };
    });

  const save = () => {
    const clean: Workout = {
      ...draft,
      name: draft.name.trim() || 'Treino sem nome',
      exercises: draft.exercises
        .map((e) => ({ ...e, name: e.name.trim(), weight: parseNumber(weightText[e.id] ?? '0') }))
        .filter((e) => e.name),
    };
    update((s) => ({
      ...s,
      workouts: existing ? s.workouts.map((w) => (w.id === clean.id ? clean : w)) : [...s.workouts, clean],
    }));
    router.back();
  };

  const remove = () =>
    Alert.alert('Excluir treino?', 'O histórico já registrado continua salvo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          update((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== draft.id) }));
          router.back();
        },
      },
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Editar treino' : 'Novo treino',
          headerLeft: () => <Button title="Cancelar" variant="ghost" small onPress={() => router.back()} />,
          headerRight: () => <Button title="Salvar" variant="ghost" small onPress={save} />,
        }}
      />
      <Screen>
        <Input
          label="Nome do treino"
          placeholder="Ex.: Treino C – Glúteos"
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
        />

        {draft.exercises.map((e, i) => (
          <Card key={e.id}>
            <Row>
              <Input
                placeholder="Nome do exercício"
                value={e.name}
                onChangeText={(name) => setExercise(e.id, { name })}
              />
              <Button title="↑" variant="soft" small onPress={() => move(i, -1)} />
              <Button title="↓" variant="soft" small onPress={() => move(i, 1)} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <T kind="muted">Séries</T>
              <Stepper value={e.sets} min={1} max={10} onChange={(sets) => setExercise(e.id, { sets })} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <T kind="muted">Repetições</T>
              <Stepper value={e.reps} min={1} max={50} onChange={(reps) => setExercise(e.id, { reps })} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <T kind="muted">Descanso</T>
              <Stepper
                value={e.rest}
                min={15}
                max={300}
                step={15}
                format={(v) => `${v}s`}
                onChange={(rest) => setExercise(e.id, { rest })}
              />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <T kind="muted">Carga (kg)</T>
              <View style={{ width: 110 }}>
                <Input
                  keyboardType="decimal-pad"
                  value={weightText[e.id] ?? ''}
                  onChangeText={(t) => setWeightText((w) => ({ ...w, [e.id]: t }))}
                  style={{ textAlign: 'center' }}
                />
              </View>
            </Row>
            <Button
              title="Remover exercício"
              variant="danger"
              small
              onPress={() => setDraft((d) => ({ ...d, exercises: d.exercises.filter((x) => x.id !== e.id) }))}
            />
          </Card>
        ))}

        <Button title="+ Adicionar exercício" variant="soft" onPress={addExercise} />
        <Button title="Salvar treino" onPress={save} />
        {existing ? <Button title="Excluir treino" variant="danger" onPress={remove} /> : null}
      </Screen>
    </>
  );
}

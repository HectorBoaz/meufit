import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, Input, Row, Screen, T } from '@/components/ui';
import { WeightChart } from '@/components/weight-chart';
import { useColors } from '@/constants/theme';
import { useStore } from '@/lib/store';
import type { BodyEntry } from '@/lib/types';
import { dateKey, formatDate, formatNumber, parseNumber, uid } from '@/lib/utils';

const MEASURES: { key: 'waist' | 'hip' | 'arm' | 'thigh'; label: string }[] = [
  { key: 'waist', label: 'Cintura' },
  { key: 'hip', label: 'Quadril' },
  { key: 'arm', label: 'Braço' },
  { key: 'thigh', label: 'Coxa' },
];

export default function Evolucao() {
  const c = useColors();
  const { state, update } = useStore();
  const [weight, setWeight] = useState('');
  const [measures, setMeasures] = useState<Record<string, string>>({});
  const [showMeasures, setShowMeasures] = useState(false);

  const sorted = [...state.body].sort((a, b) => b.date.localeCompare(a.date));
  const first = sorted[sorted.length - 1];
  const last = sorted[0];
  const diff = first && last && first !== last ? last.weight - first.weight : null;

  const save = () => {
    const w = parseNumber(weight);
    if (w <= 0) {
      Alert.alert('Informe o peso', 'Digite o peso em kg, por exemplo 62,5.');
      return;
    }
    const entry: BodyEntry = { id: uid(), date: dateKey(), weight: w };
    for (const m of MEASURES) {
      const v = parseNumber(measures[m.key] ?? '');
      if (v > 0) entry[m.key] = v;
    }
    // Um registro por dia: substitui o de hoje se já existir
    update((s) => ({ ...s, body: [...s.body.filter((b) => b.date !== entry.date), entry] }));
    setWeight('');
    setMeasures({});
    setShowMeasures(false);
  };

  const remove = (e: BodyEntry) =>
    Alert.alert('Apagar registro?', `${formatDate(e.date)} – ${formatNumber(e.weight)} kg`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => update((s) => ({ ...s, body: s.body.filter((b) => b.id !== e.id) })) },
    ]);

  return (
    <Screen>
      <T kind="title">Evolução</T>

      <Card>
        <T kind="heading">Registrar hoje</T>
        <Input
          label="Peso (kg)"
          placeholder="Ex.: 62,5"
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />
        {showMeasures ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MEASURES.map((m) => (
              <View key={m.key} style={{ width: '48%' }}>
                <Input
                  label={`${m.label} (cm)`}
                  keyboardType="decimal-pad"
                  value={measures[m.key] ?? ''}
                  onChangeText={(t) => setMeasures((x) => ({ ...x, [m.key]: t }))}
                />
              </View>
            ))}
          </View>
        ) : (
          <Button title="+ Adicionar medidas" variant="ghost" small onPress={() => setShowMeasures(true)} />
        )}
        <Button title="Salvar" onPress={save} />
      </Card>

      {sorted.length > 0 ? (
        <Card>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <T kind="muted">Atual</T>
              <T kind="big">{formatNumber(last.weight)} kg</T>
            </View>
            {diff !== null ? (
              <View style={{ alignItems: 'flex-end' }}>
                <T kind="muted">Desde o início</T>
                <T kind="heading" color={diff <= 0 ? c.success : c.accent}>
                  {diff > 0 ? '+' : ''}
                  {formatNumber(Math.round(diff * 10) / 10)} kg
                </T>
              </View>
            ) : null}
          </Row>
          <WeightChart entries={state.body} />
          {sorted.length < 2 ? <T kind="small">O gráfico aparece a partir de 2 registros.</T> : null}
        </Card>
      ) : null}

      {sorted.length > 0 ? (
        <View style={{ gap: 8 }}>
          <T kind="heading">Histórico</T>
          <Card style={{ gap: 0, paddingVertical: 4 }}>
            {sorted.map((e, i) => {
              const extras = MEASURES.filter((m) => e[m.key]).map((m) => `${m.label} ${formatNumber(e[m.key]!)}`);
              return (
                <Pressable key={e.id} onLongPress={() => remove(e)}>
                  <Row
                    style={{
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: c.border,
                    }}>
                    <View style={{ flex: 1 }}>
                      <T style={{ fontWeight: '700' }}>{formatNumber(e.weight)} kg</T>
                      {extras.length ? <T kind="small">{extras.join(' · ')} cm</T> : null}
                    </View>
                    <T kind="muted">{formatDate(e.date)}</T>
                  </Row>
                </Pressable>
              );
            })}
          </Card>
          <T kind="small">Toque e segure um registro para apagar.</T>
        </View>
      ) : null}
    </Screen>
  );
}

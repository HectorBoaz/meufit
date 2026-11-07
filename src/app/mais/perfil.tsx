import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { Button, Card, Chip, Input, Row, Screen, Stepper, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { ACTIVITY_LEVELS, bmi, bmiLabel, computeTargets, GOALS, MIN_KCAL } from '@/lib/targets';
import type { AppState, Profile } from '@/lib/types';
import { formatNumber, parseNumber } from '@/lib/utils';

export default function Perfil() {
  const c = useColors();
  const { state, update } = useStore();
  const [p, setP] = useState<Profile>(state.profile);
  const [cupMl, setCupMl] = useState(state.cupMl);
  const hasBodyLog = state.body.length > 0;
  const [weightText, setWeightText] = useState(formatNumber(state.profile.weight));
  const [kcalText, setKcalText] = useState(p.kcalOverride ? String(p.kcalOverride) : '');

  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));

  // Prévia dos cálculos com o que está sendo editado
  const draftState: AppState = {
    ...state,
    cupMl,
    profile: {
      ...p,
      weight: parseNumber(weightText) || p.weight,
      kcalOverride: parseNumber(kcalText) > 0 ? Math.round(parseNumber(kcalText)) : null,
    },
  };
  const t = computeTargets(draftState);
  const imc = bmi(draftState);

  const save = () => {
    update((s) => ({ ...s, cupMl, profile: { ...draftState.profile, configured: true } }));
    router.back();
  };

  return (
    <Screen>
      <Card>
        <T kind="heading">Sobre você</T>
        <Input label="Nome" placeholder="Como quer ser chamada?" value={p.name} onChangeText={(name) => set({ name })} />
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Sexo</T>
          <Row>
            <Chip label="Feminino" active={p.sex === 'f'} onPress={() => set({ sex: 'f' })} />
            <Chip label="Masculino" active={p.sex === 'm'} onPress={() => set({ sex: 'm' })} />
          </Row>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Idade</T>
          <Stepper value={p.age} min={14} max={90} onChange={(age) => set({ age })} format={(v) => `${v} anos`} />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Altura</T>
          <Stepper value={p.height} min={120} max={220} onChange={(height) => set({ height })} format={(v) => `${v} cm`} />
        </Row>
        {hasBodyLog ? (
          <Row style={{ justifyContent: 'space-between' }}>
            <T kind="muted">Peso (último registro)</T>
            <T style={{ fontWeight: '700' }}>{formatNumber(t.weight)} kg</T>
          </Row>
        ) : (
          <Input label="Peso (kg)" keyboardType="decimal-pad" value={weightText} onChangeText={setWeightText} />
        )}
      </Card>

      <Card>
        <T kind="heading">Nível de atividade</T>
        {ACTIVITY_LEVELS.map((a) => {
          const active = p.activity === a.value;
          return (
            <Pressable
              key={a.value}
              onPress={() => set({ activity: a.value })}
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: active ? c.accent : c.border,
                backgroundColor: active ? c.accentSoft : 'transparent',
              }}>
              <T style={{ fontWeight: '700' }}>{a.label}</T>
              <T kind="small">{a.hint}</T>
            </Pressable>
          );
        })}
      </Card>

      <Card>
        <T kind="heading">Objetivo</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {GOALS.map((g) => (
            <Chip key={g.value} label={g.label} active={p.goal === g.value} onPress={() => set({ goal: g.value })} />
          ))}
        </Row>
      </Card>

      <Card style={{ backgroundColor: c.accentSoft }}>
        <T kind="heading">Suas metas diárias</T>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Calorias</T>
          <T kind="big" color={c.accent}>{t.kcal} kcal</T>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <T kind="heading">{t.protein} g</T>
            <T kind="small">Proteína</T>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <T kind="heading">{t.carbs} g</T>
            <T kind="small">Carboidrato</T>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <T kind="heading">{t.fat} g</T>
            <T kind="small">Gordura</T>
          </View>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">💧 Água</T>
          <T style={{ fontWeight: '700' }}>
            {formatNumber(Math.round((t.cups * cupMl) / 100) / 10)} L · {t.cups} copos de {cupMl} ml
          </T>
        </Row>
        <T kind="small">
          Metabolismo basal ≈ {t.basal} kcal · gasto do dia ≈ {t.maintenance} kcal · IMC {formatNumber(Math.round(imc * 10) / 10)} (
          {bmiLabel(imc)})
        </T>
        <T kind="small">
          Cálculo pela fórmula de Mifflin-St Jeor{p.goal === 'perder' ? ' com déficit de 20%' : p.goal === 'ganhar' ? ' com superávit de 10%' : ''}{' '}
          e água em 35 ml por kg. São estimativas: um(a) nutricionista pode ajustar para você.
        </T>
      </Card>

      <Card>
        <T kind="heading">Ajustes manuais</T>
        <Input
          label={`Meta de calorias própria (deixe vazio para usar ${t.autoKcal} kcal)`}
          keyboardType="number-pad"
          placeholder={String(t.autoKcal)}
          value={kcalText}
          onChangeText={setKcalText}
        />
        {parseNumber(kcalText) > 0 && parseNumber(kcalText) < MIN_KCAL ? (
          <T kind="small" color={c.danger}>
            Atenção: menos de {MIN_KCAL} kcal por dia só com acompanhamento profissional.
          </T>
        ) : null}
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Meta de água automática</T>
          <Switch
            value={p.waterOverride === null}
            onValueChange={(auto) => set({ waterOverride: auto ? null : t.autoCups })}
            trackColor={{ true: c.accent, false: c.border }}
          />
        </Row>
        {p.waterOverride !== null ? (
          <Row style={{ justifyContent: 'space-between' }}>
            <T kind="muted">Copos por dia</T>
            <Stepper value={p.waterOverride} min={1} max={25} onChange={(v) => set({ waterOverride: v })} />
          </Row>
        ) : null}
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Tamanho do copo</T>
          <Stepper value={cupMl} min={100} max={1000} step={50} format={(v) => `${v}ml`} onChange={setCupMl} />
        </Row>
      </Card>

      <Button title="Salvar" onPress={save} />
    </Screen>
  );
}

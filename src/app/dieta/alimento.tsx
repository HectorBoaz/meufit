import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Card, Input, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { allFoods, BUILTIN_FOODS, nutrientsFor } from '@/lib/foods';
import { useStore } from '@/lib/store';
import type { Food } from '@/lib/types';
import { formatNumber, parseNumber, uid } from '@/lib/utils';

const txt = (n: number | undefined) => (n === undefined || n === null ? '' : formatNumber(n));

export default function AlimentoForm() {
  const c = useColors();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const { state, update } = useStore();
  const existing = params.id ? allFoods(state.foods).find((f) => f.id === params.id) : undefined;
  const builtin = params.id ? BUILTIN_FOODS.find((f) => f.id === params.id) : undefined;
  const isOverridden = !!builtin && state.foods.some((f) => f.id === builtin.id);

  const [name, setName] = useState(existing?.name ?? params.name ?? '');
  const [base, setBase] = useState(existing ? txt(existing.baseGrams) : '100');
  const [kcal, setKcal] = useState(txt(existing?.kcal));
  const [protein, setProtein] = useState(txt(existing?.protein));
  const [carbs, setCarbs] = useState(txt(existing?.carbs));
  const [fat, setFat] = useState(txt(existing?.fat));
  const firstPortion = existing?.portions?.[0];
  const [portionLabel, setPortionLabel] = useState(firstPortion?.label ?? '');
  const [portionGrams, setPortionGrams] = useState(txt(firstPortion?.grams));

  const baseGrams = parseNumber(base);
  const preview: Food = {
    id: 'preview',
    name,
    baseGrams,
    kcal: parseNumber(kcal),
    protein: parseNumber(protein),
    carbs: parseNumber(carbs),
    fat: parseNumber(fat),
  };
  const per100 = baseGrams > 0 ? nutrientsFor(preview, 100) : null;

  const save = () => {
    if (!name.trim()) return Alert.alert('Falta o nome', 'Dê um nome para o alimento.');
    if (baseGrams <= 0) return Alert.alert('Falta a quantidade', 'Informe a quantidade em gramas (ex.: 100).');
    if (kcal.trim() === '') return Alert.alert('Faltam as calorias', 'Informe as calorias dessa quantidade.');

    const otherPortions = existing?.portions?.slice(1) ?? [];
    const pg = parseNumber(portionGrams);
    const portions = portionLabel.trim() && pg > 0 ? [{ label: portionLabel.trim(), grams: pg }, ...otherPortions] : otherPortions;

    const food: Food = {
      id: existing?.id ?? `c:${uid()}`,
      name: name.trim(),
      baseGrams,
      kcal: parseNumber(kcal),
      protein: protein.trim() ? parseNumber(protein) : undefined,
      carbs: carbs.trim() ? parseNumber(carbs) : undefined,
      fat: fat.trim() ? parseNumber(fat) : undefined,
      category: existing?.category,
      portions: portions.length ? portions : undefined,
      custom: builtin ? undefined : true,
    };
    update((s) => ({
      ...s,
      foods: [food, ...s.foods.filter((f) => f.id !== food.id)],
      recentFoodIds: existing ? s.recentFoodIds : [food.id, ...s.recentFoodIds].slice(0, 15),
    }));
    router.back();
  };

  const remove = () =>
    Alert.alert(
      builtin ? 'Restaurar valores originais?' : 'Apagar alimento?',
      builtin ? 'Os valores voltam a ser os da tabela.' : 'O que já foi registrado no diário continua salvo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: builtin ? 'Restaurar' : 'Apagar',
          style: 'destructive',
          onPress: () => {
            update((s) => ({ ...s, foods: s.foods.filter((f) => f.id !== params.id) }));
            router.back();
          },
        },
      ],
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Editar alimento' : 'Novo alimento',
          headerLeft: () => <Button title="Cancelar" variant="ghost" small onPress={() => router.back()} />,
          headerRight: () => <Button title="Salvar" variant="ghost" small onPress={save} />,
        }}
      />
      <Screen>
        <Card>
          <Input label="Nome" placeholder="Ex.: Iogurte grego Nestlé" value={name} onChangeText={setName} />
          <T kind="muted">Copie da tabela nutricional da embalagem:</T>
          <Row style={{ alignItems: 'flex-end' }}>
            <Input label="A cada (gramas ou ml)" keyboardType="decimal-pad" value={base} onChangeText={setBase} />
            <Input label="Tem (kcal)" keyboardType="decimal-pad" value={kcal} onChangeText={setKcal} />
          </Row>
          <T kind="small">Opcional:</T>
          <Row>
            <Input label="Proteína (g)" keyboardType="decimal-pad" value={protein} onChangeText={setProtein} />
            <Input label="Carbo (g)" keyboardType="decimal-pad" value={carbs} onChangeText={setCarbs} />
            <Input label="Gordura (g)" keyboardType="decimal-pad" value={fat} onChangeText={setFat} />
          </Row>
        </Card>

        <Card>
          <T kind="heading">Porção (opcional)</T>
          <T kind="small">Para registrar mais rápido, ex.: “unidade” = 50 g, “pote” = 170 g.</T>
          <Row>
            <Input label="Nome da porção" placeholder="unidade" value={portionLabel} onChangeText={setPortionLabel} />
            <View style={{ width: 110 }}>
              <Input label="Gramas" keyboardType="decimal-pad" value={portionGrams} onChangeText={setPortionGrams} />
            </View>
          </Row>
        </Card>

        {per100 && kcal.trim() !== '' ? (
          <Card style={{ backgroundColor: c.accentSoft }}>
            <T kind="muted">Equivale a {per100.kcal} kcal a cada 100 g</T>
          </Card>
        ) : null}

        <Button title="Salvar alimento" onPress={save} />
        {existing && (!builtin || isOverridden) ? (
          <Button title={builtin ? 'Restaurar valores da tabela' : 'Apagar alimento'} variant="danger" onPress={remove} />
        ) : null}
      </Screen>
    </>
  );
}

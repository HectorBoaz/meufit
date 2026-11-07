import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, Input, Row, Screen, Stepper, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { allFoods, nutrientsFor, searchFoods } from '@/lib/foods';
import { useToday } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import type { Food, FoodLogEntry } from '@/lib/types';
import { formatNumber, parseNumber, uid } from '@/lib/utils';

function FoodRow({ food, onPress, last }: { food: Food; onPress: () => void; last?: boolean }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <Row style={{ paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border }}>
        <View style={{ flex: 1 }}>
          <T>
            {food.name}
            {food.custom ? ' ⭐' : ''}
          </T>
          <T kind="small">
            {food.kcal} kcal a cada {formatNumber(food.baseGrams)} g
          </T>
        </View>
        <T kind="muted">›</T>
      </Row>
    </Pressable>
  );
}

export default function Adicionar() {
  const c = useColors();
  const params = useLocalSearchParams<{ meal?: string; date?: string; entryId?: string }>();
  const { state, update } = useStore();
  const today = useToday();
  const foods = allFoods(state.foods);

  const editing = params.entryId ? state.foodLog.find((e) => e.id === params.entryId) : undefined;
  const editingFood: Food | undefined = editing
    ? (foods.find((f) => f.id === editing.foodId) ?? {
        id: editing.foodId,
        name: editing.name,
        baseGrams: editing.grams || 100,
        kcal: editing.kcal,
        protein: editing.protein,
        carbs: editing.carbs,
        fat: editing.fat,
      })
    : undefined;

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(editingFood?.id ?? null);
  const [meal, setMeal] = useState(editing?.meal ?? params.meal ?? state.meals[0]);
  const [gramsText, setGramsText] = useState(editing ? formatNumber(editing.grams) : '');
  const [portionIdx, setPortionIdx] = useState<number>(-1); // -1 = gramas
  const [qty, setQty] = useState(1);

  const selected = selectedId ? (foods.find((f) => f.id === selectedId) ?? editingFood) : undefined;
  const date = editing?.date ?? params.date ?? today;

  const pick = (f: Food) => {
    setSelectedId(f.id);
    if (f.portions?.length) {
      setPortionIdx(0);
      setQty(1);
    } else {
      setPortionIdx(-1);
      setGramsText(String(f.baseGrams));
    }
  };

  const portion = selected && portionIdx >= 0 ? selected.portions?.[portionIdx] : undefined;
  const grams = portion ? Math.round(portion.grams * qty * 10) / 10 : parseNumber(gramsText);
  const n = selected ? nutrientsFor(selected, grams) : null;

  const save = () => {
    if (!selected || !n || grams <= 0) return;
    const entry: FoodLogEntry = {
      id: editing?.id ?? uid(),
      date,
      meal,
      foodId: selected.id,
      name: selected.name,
      grams,
      ...n,
    };
    update((s) => ({
      ...s,
      foodLog: editing ? s.foodLog.map((e) => (e.id === entry.id ? entry : e)) : [...s.foodLog, entry],
      recentFoodIds: [selected.id, ...s.recentFoodIds.filter((id) => id !== selected.id)].slice(0, 15),
    }));
    router.back();
  };

  // ---------- Etapa 2: quantidade ----------
  if (selected) {
    return (
      <>
        <Stack.Screen options={{ title: editing ? 'Editar quantidade' : 'Quantidade' }} />
        <Screen>
          <Card>
            <T kind="heading">{selected.name}</T>
            <T kind="small">
              {selected.kcal} kcal a cada {formatNumber(selected.baseGrams)} g
              {selected.custom ? ' · alimento seu' : selected.id.startsWith('b:') ? ' · valores aproximados (TACO)' : ''}
            </T>
            {foods.some((f) => f.id === selected.id) ? (
              <Button
                title="Editar valores deste alimento"
                variant="ghost"
                small
                onPress={() => router.push({ pathname: '/dieta/alimento', params: { id: selected.id } })}
              />
            ) : null}
          </Card>

          <Card>
            <T kind="heading">Quanto você comeu?</T>
            <Row style={{ flexWrap: 'wrap' }}>
              {(selected.portions ?? []).map((p, i) => (
                <Chip key={p.label} label={p.label} active={portionIdx === i} onPress={() => setPortionIdx(i)} />
              ))}
              <Chip
                label="gramas"
                active={portionIdx === -1}
                onPress={() => {
                  if (portionIdx !== -1) setGramsText(String(grams || selected.baseGrams));
                  setPortionIdx(-1);
                }}
              />
            </Row>
            {portion ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <T kind="muted">
                  Quantidade ({formatNumber(portion.grams)} g cada)
                </T>
                <Stepper value={qty} min={0.5} max={20} step={0.5} format={formatNumber} onChange={setQty} />
              </Row>
            ) : (
              <Input
                label="Quantidade em gramas (ou ml)"
                keyboardType="decimal-pad"
                value={gramsText}
                onChangeText={setGramsText}
                autoFocus={!editing}
              />
            )}
          </Card>

          <Card>
            <T kind="heading">Refeição</T>
            <Row style={{ flexWrap: 'wrap' }}>
              {state.meals.map((m) => (
                <Chip key={m} label={m} active={meal === m} onPress={() => setMeal(m)} />
              ))}
            </Row>
          </Card>

          {n ? (
            <Card style={{ backgroundColor: c.accentSoft, alignItems: 'center' }}>
              <T kind="muted">{formatNumber(grams)} g</T>
              <T kind="big" color={c.accent}>{n.kcal} kcal</T>
              <T kind="small">
                Proteína {formatNumber(n.protein)} g · Carbo {formatNumber(n.carbs)} g · Gordura {formatNumber(n.fat)} g
              </T>
            </Card>
          ) : null}

          <Button title={editing ? 'Salvar' : 'Adicionar'} onPress={save} disabled={grams <= 0} />
          {!editing ? <Button title="Escolher outro alimento" variant="ghost" onPress={() => setSelectedId(null)} /> : null}
        </Screen>
      </>
    );
  }

  // ---------- Etapa 1: escolher alimento ----------
  const results = searchFoods(foods, query);
  const recent = state.recentFoodIds.map((id) => foods.find((f) => f.id === id)).filter((f): f is Food => !!f);

  return (
    <>
      <Stack.Screen options={{ title: params.meal ?? 'Adicionar alimento' }} />
      <Screen>
        <Input placeholder="Buscar alimento (ex.: arroz, ovo, banana)" value={query} onChangeText={setQuery} autoCorrect={false} />
        <Button
          title="+ Criar meu alimento"
          variant="soft"
          onPress={() => router.push({ pathname: '/dieta/alimento', params: query ? { name: query } : {} })}
        />

        {!query && recent.length > 0 ? (
          <View style={{ gap: 8 }}>
            <T kind="heading">Recentes</T>
            <Card style={{ gap: 0, paddingVertical: 4 }}>
              {recent.map((f, i) => (
                <FoodRow key={f.id} food={f} onPress={() => pick(f)} last={i === recent.length - 1} />
              ))}
            </Card>
          </View>
        ) : null}

        <View style={{ gap: 8 }}>
          <T kind="heading">{query ? `Resultados (${results.length})` : 'Todos os alimentos'}</T>
          {results.length ? (
            <Card style={{ gap: 0, paddingVertical: 4 }}>
              {results.map((f, i) => (
                <FoodRow key={f.id} food={f} onPress={() => pick(f)} last={i === results.length - 1} />
              ))}
            </Card>
          ) : (
            <Card>
              <T kind="muted">Não achei “{query}”. Cadastre ele com as calorias da embalagem:</T>
              <Button
                title={`Criar “${query}”`}
                onPress={() => router.push({ pathname: '/dieta/alimento', params: { name: query } })}
              />
            </Card>
          )}
        </View>
        <T kind="small">Valores da tabela são aproximados (TACO/Unicamp). ⭐ = alimento criado por você.</T>
      </Screen>
    </>
  );
}

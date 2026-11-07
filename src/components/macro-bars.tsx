import { View } from 'react-native';

import { ProgressBar, Row, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { formatNumber } from '@/lib/utils';

type Totals = { kcal: number; protein: number; carbs: number; fat: number };
type Targets = { kcal: number; protein: number; carbs: number; fat: number };

export function CalorieSummary({ totals, targets }: { totals: Totals; targets: Targets }) {
  const c = useColors();
  const remaining = targets.kcal - totals.kcal;
  const over = remaining < 0;
  return (
    <View style={{ gap: 12 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <T kind="small">Consumido</T>
          <T kind="big">{totals.kcal}</T>
          <T kind="small">de {targets.kcal} kcal</T>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <T kind="small">{over ? 'Passou' : 'Restam'}</T>
          <T kind="big" color={over ? c.danger : c.success}>
            {Math.abs(remaining)}
          </T>
          <T kind="small">kcal</T>
        </View>
      </Row>
      <ProgressBar value={totals.kcal / targets.kcal} color={over ? c.danger : c.accent} />
      <Row style={{ gap: 12 }}>
        <Macro label="Proteína" value={totals.protein} target={targets.protein} color="#7C5CFF" />
        <Macro label="Carbo" value={totals.carbs} target={targets.carbs} color="#F2A03D" />
        <Macro label="Gordura" value={totals.fat} target={targets.fat} color="#3DB7A6" />
      </Row>
    </View>
  );
}

function Macro({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <T kind="small">{label}</T>
      <ProgressBar value={target ? value / target : 0} color={color} />
      <T kind="small">
        {formatNumber(Math.round(value))}/{target} g
      </T>
    </View>
  );
}

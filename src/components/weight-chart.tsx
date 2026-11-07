import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { useColors } from '@/constants/theme';
import type { BodyEntry } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';

export function WeightChart({ entries }: { entries: BodyEntry[] }) {
  const c = useColors();
  const [width, setWidth] = useState(0);
  const height = 180;
  const pad = { top: 16, bottom: 24, left: 36, right: 12 };

  const data = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  if (data.length < 2) return null;

  const weights = data.map((d) => d.weight);
  let min = Math.min(...weights);
  let max = Math.max(...weights);
  if (max - min < 2) {
    min -= 1;
    max += 1;
  }
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w);
  const y = (v: number) => pad.top + (1 - (v - min) / (max - min)) * h;

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.weight).toFixed(1)}`).join(' ');
  const ticks = [max, (max + min) / 2, min];

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {ticks.map((t) => (
            <Line key={t} x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke={c.border} strokeWidth={1} />
          ))}
          {ticks.map((t) => (
            <SvgText key={`l${t}`} x={pad.left - 6} y={y(t) + 4} fontSize={11} fill={c.textSecondary} textAnchor="end">
              {formatNumber(Math.round(t * 10) / 10)}
            </SvgText>
          ))}
          <Path d={path} stroke={c.accent} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => (
            <Circle key={d.id} cx={x(i)} cy={y(d.weight)} r={i === data.length - 1 ? 5 : 3} fill={c.accent} />
          ))}
          <SvgText x={pad.left} y={height - 6} fontSize={11} fill={c.textSecondary}>
            {formatDate(data[0].date)}
          </SvgText>
          <SvgText x={width - pad.right} y={height - 6} fontSize={11} fill={c.textSecondary} textAnchor="end">
            {formatDate(data[data.length - 1].date)}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}

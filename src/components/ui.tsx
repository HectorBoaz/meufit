import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing, useColors } from '@/constants/theme';

export function Screen({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 120 }}>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View
      style={[
        { backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
        style,
      ]}>
      {children}
    </View>
  );
}

type TextKind = 'title' | 'heading' | 'body' | 'muted' | 'big' | 'small';

export function T({
  children,
  kind = 'body',
  style,
  color,
  numberOfLines,
}: {
  children: ReactNode;
  kind?: TextKind;
  style?: StyleProp<TextStyle>;
  color?: string;
  numberOfLines?: number;
}) {
  const c = useColors();
  const base: Record<TextKind, TextStyle> = {
    title: { fontSize: 28, fontWeight: '800', color: c.text },
    heading: { fontSize: 18, fontWeight: '700', color: c.text },
    body: { fontSize: 16, color: c.text },
    muted: { fontSize: 14, color: c.textSecondary },
    small: { fontSize: 12, color: c.textSecondary },
    big: { fontSize: 34, fontWeight: '800', color: c.text, fontVariant: ['tabular-nums'] },
  };
  return (
    <Text numberOfLines={numberOfLines} style={[base[kind], color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  small,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const c = useColors();
  const bg = { primary: c.accent, soft: c.accentSoft, ghost: 'transparent', danger: 'transparent' }[variant];
  const fg = { primary: c.onAccent, soft: c.accent, ghost: c.accent, danger: c.danger }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: Radius.md,
          paddingVertical: small ? 8 : 14,
          paddingHorizontal: small ? 12 : 18,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}>
      <Text style={{ color: fg, fontWeight: '700', fontSize: small ? 14 : 16 }}>{title}</Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps & { label?: string }) {
  const c = useColors();
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: 4, flexGrow: 1, flexBasis: 0 }}>
      {label ? <T kind="small">{label}</T> : null}
      <TextInput
        placeholderTextColor={c.textSecondary}
        {...rest}
        style={[
          {
            backgroundColor: c.background,
            color: c.text,
            borderRadius: Radius.sm,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.border,
          },
          style,
        ]}
      />
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  const c = useColors();
  const btn = (label: string, delta: number) => (
    <Pressable
      hitSlop={6}
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: c.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}>
      <Text style={{ color: c.accent, fontSize: 20, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {btn('−', -step)}
      <Text style={{ color: c.text, fontSize: 18, fontWeight: '700', minWidth: 44, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
        {format ? format(value) : value}
      </Text>
      {btn('+', step)}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, style]}>{children}</View>;
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        height: 34,
        minWidth: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? c.accent : c.background,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: active ? c.accent : c.border,
      }}>
      <Text style={{ color: active ? c.onAccent : c.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const c = useColors();
  return (
    <View style={{ height: 10, borderRadius: 5, backgroundColor: c.background, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          height: '100%',
          backgroundColor: color ?? c.accent,
          borderRadius: 5,
        }}
      />
    </View>
  );
}

export function Check({ checked, onPress, label }: { checked: boolean; onPress: () => void; label?: string }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: checked ? c.success : c.border,
          backgroundColor: checked ? c.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked ? <Text style={{ color: '#fff', fontWeight: '900' }}>✓</Text> : null}
      </View>
      {label ? (
        <Text style={{ color: c.text, fontSize: 16, textDecorationLine: checked ? 'line-through' : 'none', opacity: checked ? 0.6 : 1 }}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

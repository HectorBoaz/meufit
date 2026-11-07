import { NativeTabs } from 'expo-router/native-tabs';

import { useColors } from '@/constants/theme';

export default function AppTabs() {
  const c = useColors();
  return (
    <NativeTabs tintColor={c.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Hoje</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sun.max.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dieta">
        <NativeTabs.Trigger.Label>Dieta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="jejum">
        <NativeTabs.Trigger.Label>Jejum</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="timer" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="treinos">
        <NativeTabs.Trigger.Label>Treinos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="dumbbell.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mais">
        <NativeTabs.Trigger.Label>Mais</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis.circle.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

import { Stack } from 'expo-router';

import { useColors } from '@/constants/theme';

export default function MaisLayout() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerTintColor: c.accent,
        headerStyle: { backgroundColor: c.background },
        headerTitleStyle: { color: c.text },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
      }}>
      <Stack.Screen name="index" options={{ title: 'Mais', headerLargeTitle: true }} />
      <Stack.Screen name="perfil" options={{ title: 'Perfil e metas' }} />
      <Stack.Screen name="evolucao" options={{ title: 'Evolução' }} />
      <Stack.Screen name="lembretes" options={{ title: 'Lembretes' }} />
    </Stack>
  );
}

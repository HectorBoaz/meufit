import { Stack } from 'expo-router';

import { useColors } from '@/constants/theme';

export default function TreinosLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Treinos', headerLargeTitle: true }} />
      <Stack.Screen name="[id]" options={{ title: 'Treino' }} />
      <Stack.Screen name="editar" options={{ title: 'Editar treino', presentation: 'modal' }} />
    </Stack>
  );
}

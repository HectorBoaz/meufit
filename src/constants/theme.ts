import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    text: '#1B1B1F',
    textSecondary: '#6B6B76',
    background: '#F5F4F7',
    card: '#FFFFFF',
    border: '#E4E2E8',
    accent: '#E0457B',
    accentSoft: '#FCE4EE',
    onAccent: '#FFFFFF',
    water: '#2F80ED',
    waterSoft: '#E1EEFD',
    success: '#2E9E62',
    danger: '#D93F3F',
  },
  dark: {
    text: '#F4F3F6',
    textSecondary: '#A3A2AC',
    background: '#0E0E11',
    card: '#1C1C21',
    border: '#2C2C33',
    accent: '#F06292',
    accentSoft: '#3A1F2B',
    onAccent: '#FFFFFF',
    water: '#5A9CF2',
    waterSoft: '#18283D',
    success: '#4CC383',
    danger: '#F06464',
  },
};

export type Palette = typeof Colors.light;

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? Colors.dark : Colors.light;
}

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const Radius = { sm: 10, md: 14, lg: 20 } as const;

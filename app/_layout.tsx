// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";

import { useColorScheme } from '@/hooks/oldhook/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard-home/index" options={{ headerShown: false }} />
        <Stack.Screen name="mood-tracking/index" options={{ headerShown: false }} />
        <Stack.Screen name="breathing-exercise/index" options={{ headerShown: false }} />
        <Stack.Screen name="sleep-tracker" options={{ headerShown: false }} />
        <Stack.Screen name="meditation-room/index" options={{ headerShown: false }} />
        <Stack.Screen name="pricing/index" options={{ headerShown: false }} />
        <Stack.Screen name="analytics-insight/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="start-premium/index"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="chat" />
      <Stack.Screen name="apps" />
      <Stack.Screen name="history" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
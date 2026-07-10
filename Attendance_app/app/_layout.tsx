import { Stack } from 'expo-router';

// This is the root layout. Every screen in the /app folder
// automatically becomes a route. Stack navigation means screens
// slide in on top of each other, like a stack of cards.
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="attendance-type" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="result" />
    </Stack>
  );
}

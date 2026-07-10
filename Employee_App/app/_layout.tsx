import { useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { AppDataProvider } from '../context/AppDataContext';
import SplashScreen from '../components/SplashScreen';

// Root layout: shows the splash screen briefly, then decides whether
// to show Login or the Drawer app based on whether the user is logged in.
// Everything is wrapped in Auth + AppData providers so state is available everywhere.
export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppDataProvider>
          {showSplash ? (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <RootNavigator />
          )}
        </AppDataProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(drawer)" />
    </Stack>
  );
}

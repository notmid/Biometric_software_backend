import { Redirect } from 'expo-router';

// _layout.tsx declares a Stack.Screen for "index", but no app/index.tsx
// ever existed, so the app had no defined entry route. This app has no
// login step (identity is determined by face match at check-in time), so
// we just send people straight to Home.
export default function Index() {
  return <Redirect href="/home" />;
}

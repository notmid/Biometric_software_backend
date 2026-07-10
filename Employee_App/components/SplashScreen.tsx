import { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// Static splash screen — just the logo and app name, shown briefly on launch.
// No animation, per spec. Calls onFinish after a short delay so the root
// layout can move on to Login (or the Drawer app, if already logged in).
type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoCard}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.appName}>ProJenius Attendance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0077FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 20,
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 140,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});

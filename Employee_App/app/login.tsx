import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Login screen shown before the drawer app. Since this is frontend-only,
// any non-empty email + password combination logs the user in —
// swap the body of handleLogin for a real API call later.
export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleLogin() {
    const success = login(email, password);
    if (!success) {
      setError('Please enter both email and password.');
      return;
    }
    router.replace('/(drawer)'); // navigate into the app on success
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your employee account</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#9AA0AC" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@company.com"
              placeholderTextColor="#B5B9C2"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#9AA0AC" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#B5B9C2"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#9AA0AC"
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            This is a demo login — any email and password will work.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2B2E38',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA0AC',
    textAlign: 'center',
    marginTop: 6,
  },
  form: {
    marginTop: 36,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B5F6E',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EC',
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#2B2E38',
  },
  errorText: {
    color: '#C4392D',
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#0077FF',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#0077FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  helperText: {
    textAlign: 'center',
    color: '#B5B9C2',
    fontSize: 12,
    marginTop: 16,
  },
});

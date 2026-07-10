import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { checkIn } from '../api/client';

// Screen 5: Processing
// Sends the recorded clip to the backend (face match + liveness + speech +
// lip-sync, all run server-side by model-service) and waits for a verdict.
export default function ProcessingScreen() {
  const router = useRouter();
  const { mode, type, phrase, videoUri } = useLocalSearchParams<{
    mode: string;
    type: string;
    phrase: string;
    videoUri: string;
  }>();

  // Guards against double-submitting if this effect re-runs (e.g. fast refresh).
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    (async () => {
      try {
        const result = await checkIn({
          videoUri,
          phrase,
          attendanceType: mode === 'checkout' ? 'checkout' : 'checkin',
          attendanceClass: type === 'break' ? 'break' : 'day',
        });

        router.replace({
          pathname: '/result',
          params: {
            mode,
            type,
            status: result.status,
            time: result.time,
            confidence: result.scores?.face_match_pct != null
              ? (result.scores.face_match_pct * 100).toFixed(1)
              : '--',
            employeeName: result.employeeName ?? '',
            photoUrl: result.photoUrl ?? '',
            recognized: String(result.recognized),
            reasons: (result.reasons ?? []).join(', '),
          },
        });
      } catch (err: any) {
        router.replace({
          pathname: '/result',
          params: {
            mode,
            type,
            status: 'failed',
            time: '',
            confidence: '--',
            employeeName: '',
            photoUrl: '',
            recognized: 'false',
            reasons: err?.message || 'Something went wrong while verifying attendance.',
          },
        });
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0077ff" />
      <Text style={styles.text}>Verifying attendance...</Text>
      <Text style={styles.subtext}>This can take a few seconds.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  subtext: {
    marginTop: 6,
    fontSize: 13,
    color: '#aaa',
  },
});

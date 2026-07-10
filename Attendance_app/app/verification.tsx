import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// A small list of random phrases the employee reads aloud during verification.
// The backend's speech-match check compares what was actually said against
// whichever one of these gets picked here.
const PHRASES = [
  'The quick brown fox jumps over the lazy dog',
  'Please verify my identity for attendance',
  'Sunshine and rain make rainbows appear',
  'Today is a great day to get things done',
];

// Screen 4: Verification
// Shows a live camera preview, requests camera + microphone permission,
// displays a random phrase, and records a real video clip that gets sent
// to the backend for face/liveness/speech verification.
export default function VerificationScreen() {
  const router = useRouter();
  const { mode, type } = useLocalSearchParams<{ mode: string; type: string }>();

  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [phrase] = useState(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)]
  );

  // Ask for camera + microphone permissions as soon as this screen opens.
  useEffect(() => {
    requestCameraPermission();
    requestMicPermission();
  }, []);

  // recordAsync() doesn't resolve until stopRecording() is called (below),
  // so we kick it off here and navigate forward once it actually resolves
  // with a real file on disk.
  async function handleStartRecording() {
    if (!cameraRef.current || isRecording) return;
    setError('');
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 8 });
      if (video?.uri) {
        router.push({
          pathname: '/processing',
          params: { mode, type, phrase, videoUri: video.uri },
        });
      } else {
        setError('Recording did not produce a video. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Recording failed. Please try again.');
    } finally {
      setIsRecording(false);
    }
  }

  function handleStopRecording() {
    cameraRef.current?.stopRecording();
  }

  // Permissions are still loading
  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }

  // Permissions were denied
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera and microphone access are required to verify attendance.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => {
            requestCameraPermission();
            requestMicPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.phrase}>"{phrase}"</Text>

      <View style={styles.cameraWrapper}>
        <CameraView ref={cameraRef} mode="video" style={styles.camera} facing="front" />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!isRecording ? (
        <TouchableOpacity
          style={[styles.recordButton, styles.startButton]}
          onPress={handleStartRecording}
        >
          <Text style={styles.recordButtonText}>Start Recording</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.recordButton, styles.stopButton]}
          onPress={handleStopRecording}
        >
          <Text style={styles.recordButtonText}>Stop Recording</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  phrase: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
    fontStyle: 'italic',
  },
  cameraWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  camera: {
    flex: 1,
  },
  errorText: {
    color: '#ff8080',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  recordButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#0077ff',
  },
  stopButton: {
    backgroundColor: '#E24A4A',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

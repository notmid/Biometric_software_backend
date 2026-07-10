import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Screen 3: Attendance Type
// Employee picks Day or Break. We carry "mode" (checkin/checkout)
// forward from Home, and add "type" (day/break) for the next screen.
export default function AttendanceTypeScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();

  function goToVerification(type: 'day' | 'break') {
    router.push({
      pathname: '/verification',
      params: { mode, type },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Attendance Type</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => goToVerification('day')}
      >
        <Text style={styles.optionText}>Day</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => goToVerification('break')}
      >
        <Text style={styles.optionText}>Break</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  option: {
    width: '100%',
    paddingVertical: 28,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0077ff',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077ff',
  },
});

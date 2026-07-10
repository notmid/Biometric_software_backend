import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// Screen 6: Result
// Shows the outcome of the real attendance check: photo, name, status,
// type, time, and a confidence score, using whatever the backend actually
// returned (see app/processing.tsx). Auto-returns to Home after a delay.
export default function ResultScreen() {
  const router = useRouter();
  const {
    mode,
    type,
    status,
    time,
    confidence,
    employeeName,
    photoUrl,
    recognized,
    reasons,
  } = useLocalSearchParams<{
    mode: string;
    type: string;
    status: string;
    time: string;
    confidence: string;
    employeeName: string;
    photoUrl: string;
    recognized: string;
    reasons: string;
  }>();

  const isSuccess = status === 'success';
  const wasRecognized = recognized === 'true';

  useEffect(() => {
    // Give people a bit longer to read what went wrong on a failure.
    const timer = setTimeout(() => {
      router.replace('/home');
    }, isSuccess ? 2200 : 3800);

    return () => clearTimeout(timer);
  }, []);

  const displayName = wasRecognized && employeeName ? employeeName : 'Not recognized';
  const photoSource = photoUrl
    ? { uri: photoUrl }
    : { uri: 'https://placehold.co/120x120/4A90E2/fff?text=?' };

  return (
    <View style={styles.container}>
      <Image source={photoSource} style={styles.photo} />

      <Text style={styles.name}>{displayName}</Text>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isSuccess ? '#4AE27B' : '#E24A4A' },
        ]}
      >
        <Text style={styles.statusText}>
          {status === 'malicious' ? 'Flagged' : isSuccess ? 'Success' : 'Failed'}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow label="Type" value={type === 'day' ? 'Day' : 'Break'} />
        <DetailRow
          label={mode === 'checkin' ? 'Check In Time' : 'Check Out Time'}
          value={time || '--:--'}
        />
        <DetailRow label="Confidence Score" value={`${confidence ?? '--'}%`} />
      </View>

      {!isSuccess && reasons ? (
        <Text style={styles.reasonsText}>{reasons}</Text>
      ) : null}
    </View>
  );
}

// Small reusable row for label/value pairs in the details card
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9EF',
  },
  detailLabel: {
    color: '#888',
    fontSize: 15,
  },
  detailValue: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  reasonsText: {
    color: '#E24A4A',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

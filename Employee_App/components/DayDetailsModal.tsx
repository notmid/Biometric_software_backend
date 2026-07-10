import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarDay } from '../types';
import StatusBadge from './StatusBadge';

// Shown when the user taps a day on the Home calendar.
// Purely presentational — reads whatever CalendarDay is passed in.
type Props = {
  day: CalendarDay | null;
  onClose: () => void;
};

const STATUS_LABEL: Record<CalendarDay['status'], string> = {
  present: 'Present',
  leave: 'On Leave',
  holiday: 'Holiday',
  upcoming: 'Upcoming',
  absent: 'Absent',
};

const STATUS_TONE: Record<CalendarDay['status'], 'success' | 'warning' | 'neutral' | 'info' | 'danger'> = {
  present: 'success',
  leave: 'warning',
  holiday: 'neutral',
  upcoming: 'info',
  absent: 'danger',
};

export default function DayDetailsModal({ day, onClose }: Props) {
  if (!day) return null;

  const formattedDate = new Date(day.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal visible={!!day} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.date}>{formattedDate}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#5B5F6E" />
            </TouchableOpacity>
          </View>

          <StatusBadge label={STATUS_LABEL[day.status]} tone={STATUS_TONE[day.status]} />

          {day.status === 'present' && (
            <View style={styles.details}>
              <DetailRow label="Check In" value={day.checkIn ?? '--'} />
              <DetailRow label="Check Out" value={day.checkOut ?? '--'} />
              <DetailRow label="Hours Worked" value={day.hoursWorked ?? '--'} />
            </View>
          )}

          {day.status === 'leave' && (
            <Text style={styles.note}>
              This day was marked as leave in your attendance record.
            </Text>
          )}

          {day.status === 'holiday' && (
            <Text style={styles.note}>Company holiday — no attendance required.</Text>
          )}

          {day.status === 'upcoming' && (
            <Text style={styles.note}>This day hasn't happened yet.</Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  date: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2E38',
  },
  details: {
    marginTop: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F4',
  },
  detailLabel: {
    color: '#9AA0AC',
    fontSize: 14,
  },
  detailValue: {
    color: '#2B2E38',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    marginTop: 16,
    color: '#5B5F6E',
    fontSize: 14,
    lineHeight: 20,
  },
});

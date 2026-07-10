import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodayState } from '../types';
import DeveloperMenu from './DeveloperMenu';

// Shows today's attendance state and the relevant action button.
// The developer menu lets you manually jump between states to preview
// all three UI variants without needing real check-in logic.
type Props = {
  state: TodayState;
  onChangeState: (state: TodayState) => void;
};

const STATE_CONFIG: Record<
  TodayState,
  { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; color: string; actionLabel: string }
> = {
  'not-checked-in': {
    title: 'Not Checked In',
    subtitle: 'You haven\'t started your day yet',
    icon: 'time-outline',
    color: '#9AA0AC',
    actionLabel: 'Check In',
  },
  'checked-in': {
    title: 'Checked In',
    subtitle: 'Since 09:12 AM today',
    icon: 'checkmark-circle-outline',
    color: '#1D9A5B',
    actionLabel: 'Check Out',
  },
  'checked-out': {
    title: 'Checked Out',
    subtitle: 'You completed 8h 52m today',
    icon: 'log-out-outline',
    color: '#0077FF',
    actionLabel: 'Done for Today',
  },
};

export default function TodayAttendanceCard({ state, onChangeState }: Props) {
  const config = STATE_CONFIG[state];

  function handleActionPress() {
    if (state === 'not-checked-in') onChangeState('checked-in');
    else if (state === 'checked-in') onChangeState('checked-out');
    // "checked-out" state has no further action for today
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Attendance</Text>
        <DeveloperMenu
          options={[
            { label: 'Set: Not Checked In', onPress: () => onChangeState('not-checked-in') },
            { label: 'Set: Checked In', onPress: () => onChangeState('checked-in') },
            { label: 'Set: Checked Out', onPress: () => onChangeState('checked-out') },
          ]}
        />
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${config.color}1A` }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>{config.title}</Text>
          <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
        </View>
      </View>

      {state !== 'checked-out' && (
        <TouchableOpacity style={styles.actionButton} onPress={handleActionPress}>
          <Text style={styles.actionButtonText}>{config.actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2E38',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2E38',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#9AA0AC',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#0077FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

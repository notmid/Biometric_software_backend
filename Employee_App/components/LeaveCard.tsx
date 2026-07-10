import { View, Text, StyleSheet } from 'react-native';
import { LeaveApplication, LeaveStatus } from '../types';
import StatusBadge from './StatusBadge';
import DeveloperMenu from './DeveloperMenu';

// One row in the Leave Application list.
// The developer menu simulates what would normally happen when a
// manager approves/rejects a request from a backend.
type Props = {
  leave: LeaveApplication;
  onChangeStatus: (id: string, status: LeaveStatus) => void;
};

const STATUS_TONE: Record<LeaveStatus, 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const STATUS_LABEL: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function LeaveCard({ leave, onChangeStatus }: Props) {
  const dateRange =
    leave.startDate === leave.endDate
      ? formatDate(leave.startDate)
      : `${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.type}>{leave.type}</Text>
        <DeveloperMenu
          options={[
            { label: 'Set: Pending', onPress: () => onChangeStatus(leave.id, 'pending') },
            { label: 'Set: Approved', onPress: () => onChangeStatus(leave.id, 'approved') },
            { label: 'Set: Rejected', onPress: () => onChangeStatus(leave.id, 'rejected') },
          ]}
        />
      </View>

      <Text style={styles.dateRange}>{dateRange}</Text>
      <Text style={styles.reason}>{leave.reason}</Text>

      <View style={styles.footerRow}>
        <StatusBadge label={STATUS_LABEL[leave.status]} tone={STATUS_TONE[leave.status]} />
        <Text style={styles.appliedOn}>Applied {formatDate(leave.appliedOn)}</Text>
      </View>
    </View>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2E38',
  },
  dateRange: {
    fontSize: 13,
    color: '#5B5F6E',
    marginTop: 6,
  },
  reason: {
    fontSize: 13,
    color: '#9AA0AC',
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  appliedOn: {
    fontSize: 11,
    color: '#B5B9C2',
  },
});

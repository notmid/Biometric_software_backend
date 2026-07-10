import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../../context/AppDataContext';
import SalaryCard from '../../components/SalaryCard';
import StatusBadge from '../../components/StatusBadge';

export default function PayrollScreen() {
  const { payroll } = useAppData();

  const paymentTone =
    payroll.paymentStatus === 'Paid'
      ? 'success'
      : payroll.paymentStatus === 'Processing'
      ? 'info'
      : 'warning';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Expected salary hero card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{payroll.month} — Expected Salary</Text>
        <Text style={styles.heroValue}>
          ₹{payroll.expectedSalary.toLocaleString()}
        </Text>
        <View style={{ marginTop: 10 }}>
          <StatusBadge label={payroll.paymentStatus} tone={paymentTone} />
        </View>
      </View>

      {/* Stat grid */}
      <View style={styles.grid}>
        <SalaryCard
          icon="briefcase-outline"
          label="Working Days"
          value={`${payroll.workingDays}`}
          accentColor="#0077FF"
        />
        <SalaryCard
          icon="checkmark-done-outline"
          label="Days Present"
          value={`${payroll.daysPresent}`}
          accentColor="#1D9A5B"
        />
        <SalaryCard
          icon="calendar-outline"
          label="Leaves Taken"
          value={`${payroll.leavesTaken}`}
          accentColor="#B8791A"
        />
        <SalaryCard
          icon="time-outline"
          label="Overtime Hours"
          value={`${payroll.overtimeHours}h`}
          accentColor="#C4392D"
        />
      </View>

      {/* Breakdown card */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Salary Breakdown</Text>
        <BreakdownRow label="Base Salary" value={`₹${payroll.baseSalary.toLocaleString()}`} />
        <BreakdownRow label="Overtime Pay" value={`₹${payroll.overtimePay.toLocaleString()}`} />
        <View style={styles.divider} />
        <BreakdownRow
          label="Total Expected"
          value={`₹${payroll.expectedSalary.toLocaleString()}`}
          bold
        />
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => Alert.alert('Payslip', 'This would download your payslip PDF.')}
      >
        <Ionicons name="download-outline" size={18} color="#fff" />
        <Text style={styles.downloadButtonText}>Download Payslip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function BreakdownRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, bold && styles.breakdownLabelBold]}>{label}</Text>
      <Text style={[styles.breakdownValue, bold && styles.breakdownLabelBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: '#0077FF',
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
  },
  heroLabel: {
    color: '#E6F2FF',
    fontSize: 13,
    fontWeight: '600',
  },
  heroValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2E38',
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#5B5F6E',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#2B2E38',
    fontWeight: '600',
  },
  breakdownLabelBold: {
    fontWeight: '800',
    color: '#2B2E38',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F1F4',
    marginVertical: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2B2E38',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
});

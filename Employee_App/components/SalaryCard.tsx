import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// A single stat card used in the Payroll grid (Working Days, Leaves, Overtime, etc.)
type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accentColor: string;
};

export default function SalaryCard({ icon, label, value, accentColor }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}1A` }]}>
        <Ionicons name={icon} size={20} color={accentColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    width: '48%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2E38',
  },
  label: {
    fontSize: 12,
    color: '#9AA0AC',
    marginTop: 2,
  },
});

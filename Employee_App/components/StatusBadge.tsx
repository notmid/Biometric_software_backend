import { View, Text, StyleSheet } from 'react-native';

// A small colored pill used everywhere we show a status:
// attendance days, leave applications, query states, payment status.
// Centralizing the color logic here means every screen stays visually consistent.
type Props = {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
};

const TONE_COLORS: Record<Props['tone'], { bg: string; text: string }> = {
  success: { bg: '#E3F7EA', text: '#1D9A5B' },
  warning: { bg: '#FEF3E0', text: '#B8791A' },
  danger: { bg: '#FCE7E7', text: '#C4392D' },
  neutral: { bg: '#EDEEF2', text: '#5B5F6E' },
  info: { bg: '#E7EDFB', text: '#0077FF' },
};

export default function StatusBadge({ label, tone }: Props) {
  const colors = TONE_COLORS[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

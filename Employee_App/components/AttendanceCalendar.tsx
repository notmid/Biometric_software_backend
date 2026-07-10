import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarDay, DayStatus } from '../types';

// Renders a month grid where each day is color-coded by status.
// Tapping a day calls onSelectDay so the parent screen can open a details modal.
type Props = {
  days: CalendarDay[];
  onSelectDay: (day: CalendarDay) => void;
};

const STATUS_COLORS: Record<DayStatus, { bg: string; text: string }> = {
  present: { bg: '#0077FF', text: '#fff' },
  leave: { bg: '#FEDD9A', text: '#8A5A00' },
  holiday: { bg: '#EDEEF2', text: '#9AA0AC' },
  upcoming: { bg: '#fff', text: '#2B2E38' },
  absent: { bg: '#F8C6C1', text: '#A3271D' },
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AttendanceCalendar({ days, onSelectDay }: Props) {
  if (days.length === 0) return null;

  const firstDate = new Date(days[0].date);
  const leadingBlanks = firstDate.getDay(); // how many empty cells before day 1

  return (
    <View style={styles.container}>
      {/* Weekday header row */}
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={index} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <View key={`blank-${index}`} style={styles.cell} />
        ))}

        {days.map((day) => {
          const dayNumber = new Date(day.date).getDate();
          const colors = STATUS_COLORS[day.status];
          const isOutlined = day.status === 'upcoming';

          return (
            <TouchableOpacity
              key={day.date}
              style={styles.cell}
              onPress={() => onSelectDay(day)}
            >
              <View
                style={[
                  styles.dayCircle,
                  { backgroundColor: colors.bg },
                  isOutlined && styles.dayCircleOutlined,
                ]}
              >
                <Text style={[styles.dayText, { color: colors.text }]}>
                  {dayNumber}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={STATUS_COLORS.present.bg} label="Present" />
        <LegendItem color={STATUS_COLORS.leave.bg} label="Leave" />
        <LegendItem color={STATUS_COLORS.holiday.bg} label="Holiday" />
        <LegendItem color="#fff" outlined label="Upcoming" />
      </View>
    </View>
  );
}

function LegendItem({
  color,
  label,
  outlined,
}: {
  color: string;
  label: string;
  outlined?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
          outlined && styles.dayCircleOutlined,
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const CELL_SIZE = `${100 / 7}%` as const;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    color: '#9AA0AC',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleOutlined: {
    borderWidth: 1,
    borderColor: '#D8DBE2',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#5B5F6E',
  },
});

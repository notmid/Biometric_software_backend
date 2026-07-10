import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CalendarDay } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import AttendanceCalendar from '../../components/AttendanceCalendar';
import DayDetailsModal from '../../components/DayDetailsModal';
import TodayAttendanceCard from '../../components/TodayAttendanceCard';

export default function HomeScreen() {
  const { calendarData, todayState, setTodayState } = useAppData();
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.name ?? 'Jane Doe').split(' ')[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
      <Text style={styles.subGreeting}>Here's your attendance overview</Text>

      <View style={{ marginTop: 20 }}>
        <AttendanceCalendar days={calendarData} onSelectDay={setSelectedDay} />
      </View>

      <TodayAttendanceCard state={todayState} onChangeState={setTodayState} />

      <DayDetailsModal day={selectedDay} onClose={() => setSelectedDay(null)} />
    </ScrollView>
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
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2B2E38',
  },
  subGreeting: {
    fontSize: 14,
    color: '#9AA0AC',
    marginTop: 4,
  },
});

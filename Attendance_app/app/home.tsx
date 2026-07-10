import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Screen 2: Home
// Two big buttons: Check In and Check Out.
// Tapping either navigates to the Attendance Type screen,
// passing along which mode was picked ("checkin" or "checkout").
export default function HomeScreen() {
  const router = useRouter();

  function goToAttendanceType(mode: 'checkin' | 'checkout') {
    router.push({
      pathname: '/attendance-type',
      params: { mode },
    });
  }

  return (
    <View style={styles.container}>
      <Image 
      source={require("../assets/images/ProjeniusLogo.png")}
      style={styles.image}
      ></Image>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>What would you like to do?</Text>

      <TouchableOpacity
        style={[styles.button, styles.checkInButton]}
        onPress={() => goToAttendanceType('checkin')}
      >
        <Text style={styles.buttonText}>Check In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.checkOutButton]}
        onPress={() => goToAttendanceType('checkout')}
      >
        <Text style={styles.buttonText}>Check Out</Text>
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
  image: {
    width:150,
    height:150,
    marginBottom:8,
    alignItems:'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkInButton: {
    backgroundColor: '#0077ff',
  },
  checkOutButton: {
    backgroundColor: '#0077ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

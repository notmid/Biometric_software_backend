import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../../context/AuthContext';

// Custom drawer content: logo + profile header + nav items,
// highlighting whichever screen is currently active, plus a logout button.
const NAV_ITEMS = [
  { name: 'index', label: 'Home', icon: 'home-outline' as const },
  { name: 'payroll', label: 'Payroll', icon: 'wallet-outline' as const },
  { name: 'leave', label: 'Leave Application', icon: 'calendar-outline' as const },
  { name: 'query', label: 'Query', icon: 'help-circle-outline' as const },
];

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const activeRoute = props.state.routeNames[props.state.index];
  const { user, logout } = useAuth();

  const initials = (user?.name ?? 'Jane Doe')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.drawerContainer}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name ?? 'Jane Doe'}</Text>
        <Text style={styles.profileRole}>{user?.employeeId ?? 'EMP-0000'}</Text>
      </View>

      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => props.navigation.navigate(item.name)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? '#0077FF' : '#5B5F6E'}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.logoutItem} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#C4392D" />
        <Text style={styles.logoutLabel}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DrawerLayout() {
  const { isLoggedIn } = useAuth();

  // If the user isn't logged in (or just logged out), bounce back to login.
  // This also means logging out from anywhere in the drawer instantly
  // redirects here since isLoggedIn flips to false.
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#2B2E38',
        headerTitleStyle: { fontWeight: '700' },
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Home' }} />
      <Drawer.Screen name="payroll" options={{ title: 'Payroll' }} />
      <Drawer.Screen name="leave" options={{ title: 'Leave Application' }} />
      <Drawer.Screen name="query" options={{ title: 'Query' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  logo: {
    width: 44,
    height: 44,
    alignSelf: 'center',
    marginBottom: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F4',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0077FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2E38',
  },
  profileRole: {
    fontSize: 13,
    color: '#9AA0AC',
    marginTop: 2,
  },
  navList: {
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#E6F2FF',
  },
  navLabel: {
    marginLeft: 14,
    fontSize: 15,
    color: '#5B5F6E',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#0077FF',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 16,
    marginTop: 'auto',
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',
  },
  logoutLabel: {
    marginLeft: 14,
    fontSize: 15,
    color: '#C4392D',
    fontWeight: '600',
  },
});

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// A tiny "developer only" menu — represented as a small bug/settings icon.
// Tapping it opens a list of options (e.g. force-set attendance state,
// or change a leave/query status) without needing a real backend.
// In a production app this would be removed or hidden behind a debug flag.
type Option = {
  label: string;
  onPress: () => void;
};

type Props = {
  options: Option[];
};

export default function DeveloperMenu({ options }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="bug-outline" size={16} color="#9AA0AC" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Dev: override state</Text>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  option.onPress();
                  setVisible(false);
                }}
              >
                <Text style={styles.menuItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    width: 240,
  },
  menuTitle: {
    fontSize: 11,
    color: '#9AA0AC',
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#2B2E38',
  },
});

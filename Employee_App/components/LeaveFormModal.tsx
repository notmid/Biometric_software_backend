import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LeaveType } from '../types';

// Form shown when the user taps the floating "+" button on the Leave screen.
// Dates are plain text inputs here to keep dependencies minimal —
// swap in a real date picker (e.g. @react-native-community/datetimepicker) later.
type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (leave: { type: LeaveType; startDate: string; endDate: string; reason: string }) => void;
};

const LEAVE_TYPES: LeaveType[] = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home'];

export default function LeaveFormModal({ visible, onClose, onSubmit }: Props) {
  const [type, setType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  function handleSubmit() {
    if (!startDate || !endDate || !reason.trim()) return;
    onSubmit({ type, startDate, endDate, reason });
    setStartDate('');
    setEndDate('');
    setReason('');
    setType('Casual Leave');
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>New Leave Application</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color="#5B5F6E" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Leave Type</Text>
            <View style={styles.typeRow}>
              {LEAVE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />

            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Briefly describe your reason"
              value={reason}
              onChangeText={setReason}
              multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2E38',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B5F6E',
    marginBottom: 8,
    marginTop: 14,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F1F4',
  },
  typeChipActive: {
    backgroundColor: '#0077FF',
  },
  typeChipText: {
    fontSize: 13,
    color: '#5B5F6E',
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2B2E38',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0077FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

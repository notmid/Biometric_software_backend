import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Form shown when the user taps the floating "+" button on the Query screen.
type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (query: { subject: string; description: string }) => void;
};

export default function QueryFormModal({ visible, onClose, onSubmit }: Props) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit() {
    if (!subject.trim() || !description.trim()) return;
    onSubmit({ subject, description });
    setSubject('');
    setDescription('');
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>New Query</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#5B5F6E" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="A short summary of your query"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Explain your query in detail"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Query</Text>
          </TouchableOpacity>
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
    marginTop: 8,
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
    minHeight: 100,
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

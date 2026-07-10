import { View, Text, StyleSheet } from 'react-native';
import { QueryItem, QueryStatus } from '../types';
import StatusBadge from './StatusBadge';
import DeveloperMenu from './DeveloperMenu';

// One row in the Query list. Mirrors LeaveCard's structure/spirit
// so the two sections of the app feel consistent.
type Props = {
  query: QueryItem;
  onChangeStatus: (id: string, status: QueryStatus, answer?: string) => void;
};

export default function QueryCard({ query, onChangeStatus }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.subject}>{query.subject}</Text>
        <DeveloperMenu
          options={[
            {
              label: 'Set: Unanswered',
              onPress: () => onChangeStatus(query.id, 'unanswered', undefined),
            },
            {
              label: 'Set: Answered (sample reply)',
              onPress: () =>
                onChangeStatus(
                  query.id,
                  'answered',
                  'Thanks for reaching out — this has been resolved.'
                ),
            },
          ]}
        />
      </View>

      <Text style={styles.description}>{query.description}</Text>

      {query.status === 'answered' && query.answer && (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>Response</Text>
          <Text style={styles.answerText}>{query.answer}</Text>
        </View>
      )}

      <View style={styles.footerRow}>
        <StatusBadge
          label={query.status === 'answered' ? 'Answered' : 'Unanswered'}
          tone={query.status === 'answered' ? 'success' : 'neutral'}
        />
        <Text style={styles.submittedOn}>Submitted {formatDate(query.submittedOn)}</Text>
      </View>
    </View>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2E38',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: '#5B5F6E',
    marginTop: 6,
  },
  answerBox: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0077FF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 13,
    color: '#2B2E38',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  submittedOn: {
    fontSize: 11,
    color: '#B5B9C2',
  },
});

import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../../context/AppDataContext';
import { QueryStatus } from '../../types';
import QueryCard from '../../components/QueryCard';
import QueryFormModal from '../../components/QueryFormModal';

const TABS: QueryStatus[] = ['unanswered', 'answered'];
const TAB_LABELS: Record<QueryStatus, string> = {
  unanswered: 'Unanswered',
  answered: 'Answered',
};

export default function QueryScreen() {
  const { queries, addQuery, updateQueryStatus } = useAppData();
  const [activeTab, setActiveTab] = useState<QueryStatus>('unanswered');
  const [formVisible, setFormVisible] = useState(false);

  const filtered = queries.filter((query) => query.status === activeTab);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <QueryCard query={item} onChangeStatus={updateQueryStatus} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {TAB_LABELS[activeTab].toLowerCase()} queries. Tap + to submit one.
          </Text>
        }
      />

      {/* Floating add button */}
      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <QueryFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={(query) => {
          addQuery(query);
          setFormVisible(false);
          setActiveTab('unanswered'); // new queries land here
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#0077FF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9AA0AC',
  },
  tabTextActive: {
    color: '#fff',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9AA0AC',
    marginTop: 60,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0077FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

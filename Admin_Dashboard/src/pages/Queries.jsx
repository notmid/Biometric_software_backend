import { useState } from 'react';
import QueryCard from '../components/QueryCard';

const TABS = ['unanswered', 'answered'];
const TAB_LABELS = { unanswered: 'Unanswered', answered: 'Answered' };

export default function Queries({ queries, onAnswer }) {
  const [activeTab, setActiveTab] = useState('unanswered');
  const filtered = queries.filter((q) => q.status === activeTab);

  return (
    <div>
      <h2 className="text-xl font-bold mb-5 text-ink">Queries</h2>

      <div className="flex items-center gap-1 bg-white border border-line rounded-xl p-1 mb-5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab ? 'bg-brand text-white' : 'text-muted hover:bg-gray-50'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((q) => (
          <QueryCard key={q.id} query={q} onAnswer={onAnswer} />
        ))}
        {filtered.length === 0 && (
          <p className="text-subtle">No {TAB_LABELS[activeTab].toLowerCase()} queries.</p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Send } from 'lucide-react';
import Card from './Card';
import Avatar from './Avatar';

const STATUS_CLASSES = {
  unanswered: 'bg-warningSoft text-warning',
  answered: 'bg-successSoft text-success',
};

const STATUS_LABELS = {
  unanswered: 'Unanswered',
  answered: 'Answered',
};

// Card for a single query. Unanswered queries show an inline reply form;
// answered queries show the saved answer instead.
export default function QueryCard({ query, onAnswer }) {
  const [draft, setDraft] = useState('');

  function handleSubmit() {
    if (!draft.trim()) return;
    onAnswer(query.id, draft.trim());
    setDraft('');
  }

  return (
    <Card className="bg-white p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar name={query.employeeName} size={40} />
          <div>
            <p className="font-semibold text-ink">{query.employeeName}</p>
            <p className="text-xs text-subtle">{query.subject}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CLASSES[query.status]}`}>
          {STATUS_LABELS[query.status]}
        </span>
      </div>

      <p className="text-sm mt-2 text-muted">{query.message}</p>

      {query.status === 'answered' ? (
        <div className="mt-4 bg-brandSoft rounded-xl p-3">
          <p className="text-xs font-semibold text-brand mb-1 uppercase">Response</p>
          <p className="text-sm text-ink">{query.answer}</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a response..."
            className="flex-1 border border-line rounded-xl px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand text-white shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      )}
    </Card>
  );
}

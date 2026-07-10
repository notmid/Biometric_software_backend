import { useState } from 'react';
import { Check, X } from 'lucide-react';
import Card from './Card';
import Avatar from './Avatar';
import StatusPill from './StatusPill';
import { formatDate } from '../utils/helpers';

// One leave request card. Pending requests show an optional note field
// that gets attached whichever way the admin decides (Accept/Decline).
// Already-decided requests show the saved note instead, if one was left.
export default function LeaveCard({ leave, onDecide }) {
  const [note, setNote] = useState('');

  function handleDecide(status) {
    onDecide(leave.id, status, note.trim() || null);
    setNote('');
  }

  return (
    <Card className="bg-white p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar name={leave.employeeName} size={40} />
          <div>
            <p className="font-semibold text-ink">{leave.employeeName}</p>
            {leave.startDate && (
              <p className="text-xs text-subtle">
                {formatDate(leave.startDate)}{leave.startDate !== leave.endDate ? ` – ${formatDate(leave.endDate)}` : ''}
              </p>
            )}
          </div>
        </div>
        <StatusPill status={leave.status} />
      </div>

      <p className="text-sm mt-2 text-muted">{leave.reason}</p>

      {leave.status === 'pending' ? (
        <>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a short note (optional)"
            className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-3"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleDecide('approved')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white bg-brand"
            >
              <Check size={15} /> Accept
            </button>
            <button
              onClick={() => handleDecide('declined')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold bg-dangerSoft text-danger"
            >
              <X size={15} /> Decline
            </button>
          </div>
        </>
      ) : (
        leave.note && (
          <div className="mt-3 bg-brandSoft rounded-xl p-3">
            <p className="text-xs font-semibold text-brand mb-1 uppercase">Note</p>
            <p className="text-sm text-ink">{leave.note}</p>
          </div>
        )
      )}
    </Card>
  );
}

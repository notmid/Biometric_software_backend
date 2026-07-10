import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function InitiatePayrollModal({ onClose, onSubmit, submitting = false, error = '' }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-ink">Initiate Payroll</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <label className="text-xs font-semibold text-muted">Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-4" />

        <label className="text-xs font-semibold text-muted">End Date</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-4" />

        {error && <p className="text-xs mb-3 text-danger">{error}</p>}

        <button
          onClick={() => startDate && endDate && onSubmit(startDate, endDate)}
          disabled={submitting}
          className="w-full py-3 rounded-xl font-semibold text-white bg-brand flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Running…' : 'Run Payroll'}
        </button>
      </div>
    </div>
  );
}

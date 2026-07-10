import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { fetchWorkingDays, setWorkingDays } from '../api/client';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isWeekend(dateStr) {
  if (!dateStr) return false;
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

export default function ManageHolidaysModal({ month, year, onClose, onSaved }) {
  // month is 1-12 (matches the API), year is e.g. 2026.
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const [dates, setDates] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchWorkingDays(selectedMonth, selectedYear)
      .then((data) => {
        if (cancelled) return;
        setDates(data.holidays.length > 0 ? data.holidays : ['']);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load existing holidays.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedMonth, selectedYear]);

  function updateDate(index, value) {
    setDates((prev) => prev.map((d, i) => (i === index ? value : d)));
  }

  function removeDate(index) {
    setDates((prev) => prev.filter((_, i) => i !== index));
  }

  function addDate() {
    setDates((prev) => [...prev, '']);
  }

  async function handleSubmit() {
    const cleaned = [...new Set(dates.filter(Boolean))];
    setSubmitting(true);
    setError('');
    try {
      await setWorkingDays(selectedMonth, selectedYear, cleaned);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save holidays.');
    } finally {
      setSubmitting(false);
    }
  }

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const minDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const maxDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-[26rem] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-ink">Manage Holidays</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs font-semibold text-muted">Year</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1"
            />
          </div>
        </div>

        <p className="text-xs font-semibold text-muted mb-2">
          Holiday dates (weekends are already excluded automatically)
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-subtle">
            <Loader2 size={16} className="animate-spin mr-2" /> Loading…
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {dates.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={d}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => updateDate(i, e.target.value)}
                  className="flex-1 border border-line rounded-xl px-3 py-2 text-sm"
                />
                {isWeekend(d) && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-muted shrink-0">
                    Weekend
                  </span>
                )}
                <button
                  onClick={() => removeDate(i)}
                  className="p-2 rounded-lg hover:bg-gray-100 shrink-0"
                  aria-label="Remove date"
                >
                  <Trash2 size={16} className="text-subtle" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <button
            onClick={addDate}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand mb-5"
          >
            <Plus size={16} /> Add date
          </button>
        )}

        {error && <p className="text-xs mb-3 text-danger">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-brand flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Saving…' : 'Save Holidays'}
        </button>
      </div>
    </div>
  );
}

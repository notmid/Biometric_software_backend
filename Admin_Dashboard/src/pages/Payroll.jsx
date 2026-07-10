import { useState } from 'react';
import { formatDate, formatMoney } from '../utils/helpers';
import Card from '../components/Card';
import InitiatePayrollModal from '../components/InitiatePayrollModal';

export default function Payroll({ payrollRuns, onInitiate }) {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(start, end) {
    setSubmitting(true);
    setError('');
    try {
      await onInitiate(start, end);
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Could not run payroll.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-ink">Payroll</h2>
        <button
          onClick={() => { setError(''); setShowModal(true); }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand"
        >
          Initiate Payroll
        </button>
      </div>

      <div className="space-y-4">
        {payrollRuns.map((p) => (
          <Card key={p.id} className="bg-white p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink">
                {formatDate(p.startDate)} – {formatDate(p.endDate)}
              </p>
              <p className="text-xs mt-1 text-subtle">Processed {formatDate(p.processedOn)}</p>
            </div>
            <p className="font-bold text-lg text-brand">{formatMoney(p.total)}</p>
          </Card>
        ))}
        {payrollRuns.length === 0 && (
          <p className="text-subtle text-sm">No payroll runs yet.</p>
        )}
      </div>

      {showModal && (
        <InitiatePayrollModal
          onClose={() => !submitting && setShowModal(false)}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

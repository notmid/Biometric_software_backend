const STATUS_CLASSES = {
  pending: 'bg-warningSoft text-warning',
  approved: 'bg-successSoft text-success',
  declined: 'bg-dangerSoft text-danger',
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
};

export default function StatusPill({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

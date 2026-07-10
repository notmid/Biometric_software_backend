import LeaveCard from '../components/LeaveCard';

export default function LeaveRequests({ leaveRequests, onDecide }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-5 text-ink">Leave Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leaveRequests.map((l) => (
          <LeaveCard key={l.id} leave={l} onDecide={onDecide} />
        ))}
      </div>
    </div>
  );
}

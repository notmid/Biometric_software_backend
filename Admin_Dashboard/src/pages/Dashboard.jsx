import { useState, useEffect } from 'react';
import Card from '../components/Card';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { fetchTodayAttendanceSummary } from '../api/client';

export default function Dashboard({ employees, leaveRequests, queries, onNavigate }) {
  const [attendance, setAttendance] = useState({ present: 0, total: employees.length });
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingAttendance(true);
    fetchTodayAttendanceSummary()
      .then((data) => {
        if (!cancelled) setAttendance(data);
      })
      .catch(() => {
        if (!cancelled) setAttendance({ present: 0, total: employees.length });
      })
      .finally(() => {
        if (!cancelled) setLoadingAttendance(false);
      });
    return () => { cancelled = true; };
  }, [employees.length]);

  const { present, total } = attendance;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Today's attendance - full width */}
      <Card className="p-8 flex items-center justify-between bg-brand">
        <div>
          <p className="text-sm font-semibold text-brandSoft">Today's Attendance</p>
          <p className="text-5xl font-extrabold text-white mt-2">
            {loadingAttendance ? '—' : present}
            <span className="text-2xl font-semibold opacity-70">/{loadingAttendance ? '—' : total}</span>
          </p>
          <p className="text-sm mt-2 text-brandSoft">employees present today</p>
        </div>
        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white/30">
          <span className="text-white font-bold text-xl">{loadingAttendance ? '—' : `${pct}%`}</span>
        </div>
      </Card>

      {/* Calendar (75%) + Alerts (25%) - always side by side */}
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <AttendanceCalendar employees={employees} />
        </div>

        <Card className="bg-white p-6 col-span-1">
          <h3 className="font-bold mb-4 text-ink">Alerts</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {pendingLeaves.map((l) => (
              <button key={l.id} onClick={() => onNavigate('leave')} className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full shrink-0 bg-warning" />
                <p className="text-sm"><span className="font-semibold">{l.employeeName}</span> requested leave</p>
              </button>
            ))}
            {queries.map((q) => (
              <button key={q.id} onClick={() => onNavigate('queries')} className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full shrink-0 bg-brand" />
                <p className="text-sm"><span className="font-semibold">{q.employeeName}</span> submitted a query</p>
              </button>
            ))}
            {pendingLeaves.length === 0 && queries.length === 0 && (
              <p className="text-sm text-subtle">No new alerts.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, Settings } from 'lucide-react';
import { fetchAttendanceCalendar } from '../api/client';
import Card from './Card';
import ManageHolidaysModal from './ManageHolidaysModal';

const STATUS_CLASSES = {
  present: 'bg-brand text-white',
  holiday: 'bg-gray-100 text-muted',
  upcoming: 'bg-white text-muted border border-line',
};

function LegendDot({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

// Normalizes a day record coming back from /api/attendance/calendar into the
// shape this component renders. Server is expected to return one entry per
// day of the month with at least { day, status, presentCount, absentEmployees }.
function normalizeDay(raw, year, month) {
  const day = raw.day ?? new Date(raw.date).getDate();
  return {
    day,
    date: raw.date ? new Date(raw.date) : new Date(year, month, day),
    status: raw.status ?? 'upcoming',
    presentCount: raw.presentCount ?? 0,
    absentEmployees: raw.absentEmployees ?? [],
  };
}

export default function AttendanceCalendar({ employees }) {
  const [monthDate, setMonthDate] = useState(new Date('2026-07-01'));
  const [selectedDay, setSelectedDay] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const loadCalendar = useCallback(() => {
    setLoading(true);
    setError('');
    return fetchAttendanceCalendar(month + 1, year)
      .then((data) => {
        setDays(data.map((d) => normalizeDay(d, year, month)));
      })
      .catch((err) => {
        setError(err.message || 'Could not load attendance calendar.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [month, year]);

  useEffect(() => {
    let cancelled = false;
    loadCalendar().then(() => {
      if (cancelled) return;
    });
    return () => { cancelled = true; };
  }, [loadCalendar]);

  const leadingBlanks = new Date(year, month, 1).getDay();

  function changeMonth(delta) {
    const next = new Date(monthDate);
    next.setMonth(next.getMonth() + delta);
    setMonthDate(next);
  }

  return (
    <Card className="bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-ink">Attendance Calendar</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-sm w-32 text-center">
            {monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-gray-100">
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setShowHolidayModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-line hover:bg-gray-50 ml-1"
          >
            <Settings size={14} />
            Manage Holidays
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-subtle">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading calendar…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-subtle">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
            {days.map((d) => (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d)}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-transform hover:scale-105 ${STATUS_CLASSES[d.status] ?? STATUS_CLASSES.upcoming}`}
              >
                {d.day}
              </button>
            ))}
          </div>

          <div className="flex gap-5 mt-5">
            <LegendDot colorClass="bg-brand" label="Present" />
            <LegendDot colorClass="bg-gray-200" label="Holiday" />
            <LegendDot colorClass="bg-white border border-line" label="Upcoming" />
          </div>
        </>
      )}

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold">{selectedDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
              <button onClick={() => setSelectedDay(null)}><X size={18} /></button>
            </div>
            {selectedDay.status === 'present' ? (
              <>
                <p className="text-sm mb-2 text-muted">
                  <span className="font-bold text-brand">{selectedDay.presentCount}</span> / {employees.length} present
                </p>
                {selectedDay.absentEmployees.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1 text-subtle">Absent</p>
                    {selectedDay.absentEmployees.map((name) => (
                      <p key={name} className="text-sm">{name}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-subtle">
                {selectedDay.status === 'holiday' ? 'Company holiday.' : "This day hasn't happened yet."}
              </p>
            )}
          </div>
        </div>
      )}

      {showHolidayModal && (
        <ManageHolidaysModal
          month={month + 1}
          year={year}
          onClose={() => setShowHolidayModal(false)}
          onSaved={loadCalendar}
        />
      )}
    </Card>
  );
}

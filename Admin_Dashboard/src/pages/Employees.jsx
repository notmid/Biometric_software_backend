import { useState, useMemo } from 'react';
import { Plus, ArrowUpDown } from 'lucide-react';
import { formatDate, formatMoney } from '../utils/helpers';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import AddEmployeeModal from '../components/AddEmployeeModal';

const SORT_OPTIONS = [
  { key: 'name-asc', label: 'Name (A–Z)' },
  { key: 'doj-newest', label: 'Date of Joining (Newest first)' },
  { key: 'doj-oldest', label: 'Date of Joining (Oldest first)' },
];

function sortEmployees(employees, sortKey) {
  const sorted = [...employees];
  if (sortKey === 'name-asc') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortKey === 'doj-newest') {
    return sorted.sort((a, b) => new Date(b.dateOfJoining) - new Date(a.dateOfJoining));
  }
  if (sortKey === 'doj-oldest') {
    return sorted.sort((a, b) => new Date(a.dateOfJoining) - new Date(b.dateOfJoining));
  }
  return sorted;
}

export default function Employees({ employees, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [sortKey, setSortKey] = useState('name-asc');

  const sorted = useMemo(() => sortEmployees(employees, sortKey), [employees, sortKey]);

  return (
    <div className="relative pb-20">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-ink">Employees</h2>

        <div className="flex items-center gap-2 bg-white border border-line rounded-xl px-3 py-2">
          <ArrowUpDown size={14} className="text-subtle" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="text-sm font-semibold text-muted outline-none bg-transparent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((e) => (
          <Card key={e.id} className="bg-white p-5 flex items-center gap-4">
            <Avatar name={e.name} photo={e.photoUrl} size={48} />
            <div>
              <p className="font-semibold text-ink">{e.name}</p>
              <p className="text-xs text-subtle">{e.designation}</p>
              <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brandSoft text-brand">
                {e.department}
              </span>
              <p className="text-xs text-subtle mt-1.5">Joined {formatDate(e.dateOfJoining)}</p>
              <p className="text-xs text-subtle">{e.contact}</p>
              <p className="text-xs font-semibold text-ink">Base Salary: {formatMoney(e.baseSalary)}</p>
            </div>
          </Card>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg bg-brand"
      >
        <Plus size={26} />
      </button>

      {showModal && (
        <AddEmployeeModal
          onClose={() => setShowModal(false)}
          onAdd={onAdd}
        />
      )}
    </div>
  );
}

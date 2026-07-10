import { useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { DEPARTMENTS } from '../data/dummyData';

export default function AddEmployeeModal({ onClose, onAdd }) {
  // onAdd should return a Promise. The modal stays open (and shows an
  // error) if it rejects, and only closes itself after a real success.
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [designation, setDesignation] = useState('');
  const [contact, setContact] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!name.trim() || !designation.trim() || !contact.trim() || !dateOfJoining || !baseSalary) {
      setError('Please fill in every field.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        department,
        designation: designation.trim(),
        contact: contact.trim(),
        dateOfJoining,
        baseSalary: Number(baseSalary),
        photoUrl,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not add the employee.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-96 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-ink">Add Employee</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="flex justify-center mb-5">
          <label className="cursor-pointer relative">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-brandSoft">
                <Camera size={22} className="text-brand" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <label className="text-xs font-semibold text-muted">Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-4" placeholder="e.g. Alex Chen" />

        <label className="text-xs font-semibold text-muted">Department</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-4">
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <label className="text-xs font-semibold text-muted">Designation</label>
        <input value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-4" placeholder="e.g. Product Manager" />

        <label className="text-xs font-semibold text-muted">Contact Number</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-4" placeholder="e.g. 9876543210" />

        <label className="text-xs font-semibold text-muted">Date of Joining</label>
        <input type="date" value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-4" />

        <label className="text-xs font-semibold text-muted">Base Salary (annual)</label>
        <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1 mb-2" placeholder="e.g. 75000" />

        {error && <p className="text-xs mb-3 text-danger">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-xl font-semibold text-white bg-brand mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Adding…' : 'Add Employee'}
        </button>
      </div>
    </div>
  );
}

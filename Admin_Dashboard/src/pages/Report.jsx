import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import { fetchMonthlyReport } from '../api/client';

export default function Report() {
  const [monthDate, setMonthDate] = useState(new Date('2026-07-01'));
  const [employeeReport, setEmployeeReport] = useState([]);
  const [departmentReport, setDepartmentReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchMonthlyReport(month + 1, year)
      .then((data) => {
        if (cancelled) return;
        setEmployeeReport(data.employeeReport);
        setDepartmentReport(data.departmentReport);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load the report.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [month, year]);

  function changeMonth(delta) {
    const next = new Date(monthDate);
    next.setMonth(next.getMonth() + delta);
    setMonthDate(next);
  }

  function handleDownload() {
    const employeeSheetData = employeeReport.map((row) => ({
      'Employee Name': row.name,
      Department: row.department,
      Designation: row.designation,
      'Working Days': row.workingDays,
      'Days Present': row.daysPresent,
      'Days Absent': row.daysAbsent,
      'Leaves Taken': row.leavesTaken,
      'Late Arrivals': row.lateArrivals,
      'Attendance %': row.attendancePct,
    }));

    const departmentSheetData = departmentReport.map((row) => ({
      Department: row.department,
      Headcount: row.headcount,
      'Working Days': row.workingDays,
      'Total Present (days)': row.totalPresent,
      'Total Absent (days)': row.totalAbsent,
      'Total Leaves': row.totalLeaves,
      'Total Late Arrivals': row.totalLateArrivals,
      'Avg Attendance %': row.avgAttendancePct,
    }));

    const workbook = XLSX.utils.book_new();
    const employeeSheet = XLSX.utils.json_to_sheet(employeeSheetData);
    const departmentSheet = XLSX.utils.json_to_sheet(departmentSheetData);

    XLSX.utils.book_append_sheet(workbook, departmentSheet, 'Department Summary');
    XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee Report');

    const fileName = `Attendance_Report_${monthDate.getFullYear()}_${String(monthDate.getMonth() + 1).padStart(2, '0')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-ink">Reports</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-line rounded-xl px-2 py-1.5">
            <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold w-28 text-center">
              {monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading || employeeReport.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand disabled:opacity-60"
          >
            <Download size={16} />
            Download Excel Report
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-subtle">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading report…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-brandSoft">
                <FileSpreadsheet size={20} className="text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">{departmentReport.length}</p>
                <p className="text-xs text-subtle">Departments</p>
              </div>
            </Card>
            <Card className="bg-white p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-brandSoft">
                <FileSpreadsheet size={20} className="text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">{employeeReport.length}</p>
                <p className="text-xs text-subtle">Employees</p>
              </div>
            </Card>
            <Card className="bg-white p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-brandSoft">
                <FileSpreadsheet size={20} className="text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">
                  {employeeReport.length > 0
                    ? Math.round(employeeReport.reduce((s, r) => s + r.attendancePct, 0) / employeeReport.length)
                    : 0}%
                </p>
                <p className="text-xs text-subtle">Avg. Attendance</p>
              </div>
            </Card>
            <Card className="bg-white p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-brandSoft">
                <FileSpreadsheet size={20} className="text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">
                  {employeeReport.reduce((s, r) => s + r.lateArrivals, 0)}
                </p>
                <p className="text-xs text-subtle">Late Arrivals</p>
              </div>
            </Card>
          </div>

          <Card className="bg-white p-6 mb-6 overflow-x-auto">
            <h3 className="font-bold mb-4 text-ink">Department Summary</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-subtle">
                  <th className="pb-2 font-semibold">Department</th>
                  <th className="pb-2 font-semibold">Headcount</th>
                  <th className="pb-2 font-semibold">Present (days)</th>
                  <th className="pb-2 font-semibold">Absent (days)</th>
                  <th className="pb-2 font-semibold">Leaves</th>
                  <th className="pb-2 font-semibold">Late Arrivals</th>
                  <th className="pb-2 font-semibold">Avg Attendance</th>
                </tr>
              </thead>
              <tbody>
                {departmentReport.map((row) => (
                  <tr key={row.department} className="border-t border-line">
                    <td className="py-2.5 font-semibold text-ink">{row.department}</td>
                    <td className="py-2.5">{row.headcount}</td>
                    <td className="py-2.5">{row.totalPresent}</td>
                    <td className="py-2.5">{row.totalAbsent}</td>
                    <td className="py-2.5">{row.totalLeaves}</td>
                    <td className="py-2.5">{row.totalLateArrivals}</td>
                    <td className="py-2.5 font-semibold text-brand">{row.avgAttendancePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="bg-white p-6 overflow-x-auto">
            <h3 className="font-bold mb-4 text-ink">Employee Report</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-subtle">
                  <th className="pb-2 font-semibold">Employee</th>
                  <th className="pb-2 font-semibold">Department</th>
                  <th className="pb-2 font-semibold">Present</th>
                  <th className="pb-2 font-semibold">Absent</th>
                  <th className="pb-2 font-semibold">Leaves</th>
                  <th className="pb-2 font-semibold">Late Arrivals</th>
                  <th className="pb-2 font-semibold">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {employeeReport.map((row) => (
                  <tr key={row.name} className="border-t border-line">
                    <td className="py-2.5 font-semibold text-ink">{row.name}</td>
                    <td className="py-2.5">{row.department}</td>
                    <td className="py-2.5">{row.daysPresent}</td>
                    <td className="py-2.5">{row.daysAbsent}</td>
                    <td className="py-2.5">{row.leavesTaken}</td>
                    <td className="py-2.5">{row.lateArrivals}</td>
                    <td className="py-2.5 font-semibold text-brand">{row.attendancePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

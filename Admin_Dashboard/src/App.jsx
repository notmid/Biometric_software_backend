import { useState, useEffect, useCallback } from 'react';
import TopNav from './components/TopNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequests';
import Queries from './pages/Queries';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Report from './pages/Report';
import {
  isLoggedIn,
  fetchMe,
  logout as apiLogout,
  fetchEmployees,
  createEmployee,
  fetchLeaveRequests,
  decideLeaveRequest,
  fetchQueries,
  answerQuery,
  fetchPayrollRuns,
  initiatePayroll,
} from './api/client';

export default function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');

  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [queries, setQueries] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // On first load, if a token is already saved, verify it against the
  // server rather than trusting it blindly.
  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) {
        setCheckingSession(false);
        return;
      }
      try {
        const data = await fetchMe();
        setAdminUser(data?.admin ?? data ?? { name: 'Admin User' });
      } catch {
        apiLogout();
        setAdminUser(null);
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const [emp, leaves, qs, payroll] = await Promise.all([
        fetchEmployees(),
        fetchLeaveRequests(),
        fetchQueries(),
        fetchPayrollRuns(),
      ]);
      setEmployees(emp);
      setLeaveRequests(leaves);
      setQueries(qs);
      setPayrollRuns(payroll);
    } catch (err) {
      setDataError(err.message || 'Failed to load data from the server.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (adminUser) loadAllData();
  }, [adminUser, loadAllData]);

  async function handleDecide(id, status, note) {
    const prev = leaveRequests;
    setLeaveRequests((p) => p.map((l) => (l.id === id ? { ...l, status, note } : l)));
    try {
      await decideLeaveRequest(id, status, note);
    } catch (err) {
      setLeaveRequests(prev);
      alert(err.message || 'Could not update the leave request.');
    }
  }

  async function handleAddEmployee(emp) {
    const created = await createEmployee(emp);
    setEmployees((prev) => [...prev, created]);
  }

  async function handleInitiatePayroll(startDate, endDate) {
    const run = await initiatePayroll(startDate, endDate);
    setPayrollRuns((prev) => [run, ...prev]);
  }

  async function handleAnswerQuery(id, answer) {
    const prev = queries;
    setQueries((p) => p.map((q) => (q.id === id ? { ...q, status: 'answered', answer } : q)));
    try {
      await answerQuery(id, answer);
    } catch (err) {
      setQueries(prev);
      alert(err.message || 'Could not send the answer.');
    }
  }

  function handleLogin(user) {
    setAdminUser(user);
  }

  function handleLogout() {
    apiLogout();
    setAdminUser(null);
    setActiveTab('dashboard');
    setEmployees([]);
    setLeaveRequests([]);
    setQueries([]);
    setPayrollRuns([]);
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <p className="text-sm text-subtle">Checking session…</p>
      </div>
    );
  }

  // Gate the whole app behind sign-in.
  if (!adminUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-page">
      <TopNav active={activeTab} onChange={setActiveTab} adminUser={adminUser} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {dataError && (
          <div className="mb-5 bg-dangerSoft text-danger text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{dataError}</span>
            <button onClick={loadAllData} className="underline">Retry</button>
          </div>
        )}

        {loadingData && employees.length === 0 && !dataError ? (
          <p className="text-sm text-subtle">Loading data from server…</p>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard employees={employees} leaveRequests={leaveRequests} queries={queries} onNavigate={setActiveTab} />
            )}
            {activeTab === 'leave' && <LeaveRequests leaveRequests={leaveRequests} onDecide={handleDecide} />}
            {activeTab === 'queries' && <Queries queries={queries} onAnswer={handleAnswerQuery} />}
            {activeTab === 'employees' && <Employees employees={employees} onAdd={handleAddEmployee} />}
            {activeTab === 'payroll' && (
              <Payroll payrollRuns={payrollRuns} onInitiate={handleInitiatePayroll} />
            )}
            {activeTab === 'report' && <Report />}
          </>
        )}
      </main>
    </div>
  );
}

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  CalendarDay,
  LeaveApplication,
  LeaveStatus,
  QueryItem,
  QueryStatus,
  TodayState,
} from '../types';
import {
  generateCalendarData,
  dummyLeaveApplications,
  dummyQueries,
  dummyPayroll,
} from '../data/dummyData';

// This context holds all app data in memory (no backend yet).
// Wrapping the whole app in this Provider means every screen —
// Home, Payroll, Leave, Query — reads and writes the same shared state,
// so switching drawer tabs never loses your changes.
type AppDataContextType = {
  todayState: TodayState;
  setTodayState: (state: TodayState) => void;

  calendarData: CalendarDay[];

  leaveApplications: LeaveApplication[];
  addLeaveApplication: (leave: Omit<LeaveApplication, 'id' | 'status' | 'appliedOn'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus) => void;

  queries: QueryItem[];
  addQuery: (query: Omit<QueryItem, 'id' | 'status' | 'submittedOn'>) => void;
  updateQueryStatus: (id: string, status: QueryStatus, answer?: string) => void;

  payroll: typeof dummyPayroll;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [todayState, setTodayState] = useState<TodayState>('not-checked-in');
  const [calendarData] = useState<CalendarDay[]>(() => generateCalendarData());
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>(
    dummyLeaveApplications
  );
  const [queries, setQueries] = useState<QueryItem[]>(dummyQueries);

  function addLeaveApplication(leave: Omit<LeaveApplication, 'id' | 'status' | 'appliedOn'>) {
    const newLeave: LeaveApplication = {
      ...leave,
      id: `lv-${Date.now()}`,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveApplications((prev) => [newLeave, ...prev]);
  }

  function updateLeaveStatus(id: string, status: LeaveStatus) {
    setLeaveApplications((prev) =>
      prev.map((leave) => (leave.id === id ? { ...leave, status } : leave))
    );
  }

  function addQuery(query: Omit<QueryItem, 'id' | 'status' | 'submittedOn'>) {
    const newQuery: QueryItem = {
      ...query,
      id: `qr-${Date.now()}`,
      status: 'unanswered',
      submittedOn: new Date().toISOString().split('T')[0],
    };
    setQueries((prev) => [newQuery, ...prev]);
  }

  function updateQueryStatus(id: string, status: QueryStatus, answer?: string) {
    setQueries((prev) =>
      prev.map((query) => (query.id === id ? { ...query, status, answer } : query))
    );
  }

  return (
    <AppDataContext.Provider
      value={{
        todayState,
        setTodayState,
        calendarData,
        leaveApplications,
        addLeaveApplication,
        updateLeaveStatus,
        queries,
        addQuery,
        updateQueryStatus,
        payroll: dummyPayroll,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

// Hook used by every screen/component to access shared app data.
export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

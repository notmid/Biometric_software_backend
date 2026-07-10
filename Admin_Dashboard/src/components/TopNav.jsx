import { LayoutDashboard, CalendarClock, Wallet, MessagesSquare, Users, FileSpreadsheet, Bell, LogOut } from 'lucide-react';
import Avatar from './Avatar';
import logo from '../assets/logo.png';

// Distinctive nav labels while still mapping onto the required sections:
// Dashboard -> Overview, Leave Requests -> Time Off, Queries -> Inbox, Employees -> Roster.
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'leave', label: 'Leave Approval', icon: CalendarClock },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'queries', label: 'Queries', icon: MessagesSquare },
  { key: 'employees', label: 'Employee', icon: Users },
  { key: 'report', label: 'Reports', icon: FileSpreadsheet },
];

export default function TopNav({ active, onChange, adminUser, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ProJenius" className="w-9 h-9 rounded-lg" />
          <span className="font-bold text-lg tracking-tight text-ink">
            ProJenius <span className="text-brand">Admin</span>
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand text-white' : 'text-muted hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Avatar name={adminUser?.name ?? 'Admin User'} size={36} />
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm font-semibold px-2 py-1.5 rounded-lg text-muted hover:bg-gray-50"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

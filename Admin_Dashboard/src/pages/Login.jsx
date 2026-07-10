import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';
import { login } from '../api/client';

// Real auth — POSTs to /api/auth/login on the local server and stores the
// returned token. onLogin receives the admin user object on success.
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await login(email.trim(), password);
      const user = data?.admin ?? { name: email.split('@')[0], email };
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-page">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="ProJenius" className="w-16 h-16 rounded-2xl" />
        </div>

        <h1 className="text-2xl font-extrabold text-center text-ink">Admin Sign In</h1>
        <p className="text-sm text-center mt-2 mb-8 text-subtle">
          Sign in to manage attendance, payroll, and reports
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-line p-6">
          <label className="text-xs font-semibold text-muted">Email</label>
          <div className="flex items-center gap-2 border border-line rounded-xl px-3 mt-1 mb-4">
            <Mail size={16} className="text-subtle" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@company.com"
              className="flex-1 py-2.5 text-sm outline-none"
              autoComplete="username"
            />
          </div>

          <label className="text-xs font-semibold text-muted">Password</label>
          <div className="flex items-center gap-2 border border-line rounded-xl px-3 mt-1 mb-2">
            <Lock size={16} className="text-subtle" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="flex-1 py-2.5 text-sm outline-none"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} className="text-subtle" /> : <Eye size={16} className="text-subtle" />}
            </button>
          </div>

          {error && <p className="text-xs mb-3 text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white mt-4 bg-brand flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-xs mt-4 text-faint">
            Connects to your local server at localhost:5000
          </p>
        </form>
      </div>
    </div>
  );
}

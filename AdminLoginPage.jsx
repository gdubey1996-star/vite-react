import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../utils/api';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Enter username and password'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.post('/auth/admin-login', form);
      if (data.success) {
        localStorage.setItem('ker_admin_token', data.token);
        localStorage.setItem('ker_admin', JSON.stringify(data.admin));
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-900 to-amber-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🪔</div>
          <h1 className="font-display text-2xl font-bold text-saffron-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Kashi Eternal Rewards</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              className="input-field mt-1"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input-field mt-1"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Staff? Use your assigned credentials
        </p>
      </div>
    </div>
  );
}

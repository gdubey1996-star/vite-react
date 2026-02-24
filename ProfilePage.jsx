import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

const TIER_PERKS = {
  ETERNAL: ['Earn 10 pts per ₹100', 'Access to basic rewards'],
  SILVER: ['All Eternal perks', '+10% bonus points', 'Silver exclusive rewards'],
  GOLD: ['All Silver perks', '+25% bonus points', 'Priority check-in', 'Gold exclusive rewards'],
  PLATINUM: ['All Gold perks', '+50% bonus points', 'Dedicated concierge', 'Complimentary upgrade', 'All rewards access'],
};

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', dateOfBirth: user?.dateOfBirth?.slice(0,10) || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/user/profile', form);
      updateUser(form);
      setEditing(false);
      setMessage(lang === 'en' ? 'Profile updated!' : 'प्रोफ़ाइल अपडेट हुई!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(lang === 'en' ? 'Logout?' : 'लॉगआउट करें?')) {
      logout();
      navigate('/login');
    }
  };

  const tier = user?.tier || 'ETERNAL';
  const TIER_COLORS = { ETERNAL: 'bg-gray-100 text-gray-700', SILVER: 'bg-gray-200 text-gray-800', GOLD: 'bg-amber-100 text-amber-800', PLATINUM: 'bg-purple-100 text-purple-800' };

  return (
    <Layout title={t.profile}>
      <div className="animate-fade-in space-y-4">

        {/* Profile Header */}
        <div className="kashi-card p-5 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-saffron-400 to-amber-500 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
            {user?.name ? user.name[0].toUpperCase() : '🙏'}
          </div>
          <h2 className="font-display text-xl font-bold text-saffron-900">{user?.name || (lang === 'en' ? 'Set your name' : 'नाम सेट करें')}</h2>
          <p className="text-gray-500 text-sm">+91 {user?.phone}</p>
          <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${TIER_COLORS[tier]}`}>
            {tier} Member
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: lang === 'en' ? 'Points' : 'अंक', value: (user?.points || 0).toLocaleString('en-IN') },
            { label: lang === 'en' ? 'Visits' : 'भेंट', value: user?.visitCount || 0 },
            { label: lang === 'en' ? 'Spent' : 'खर्च', value: `₹${((user?.totalSpent || 0) / 1000).toFixed(1)}K` },
          ].map(s => (
            <div key={s.label} className="kashi-card p-3 text-center">
              <p className="text-lg font-bold text-saffron-700">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toast */}
        {message && (
          <div className="kashi-card p-3 text-center text-sm text-saffron-800 bg-saffron-50">{message}</div>
        )}

        {/* Edit Profile */}
        <div className="kashi-card p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-saffron-900">{lang === 'en' ? 'Personal Info' : 'व्यक्तिगत जानकारी'}</h3>
            <button
              onClick={() => setEditing(!editing)}
              className="text-saffron-600 text-sm font-medium"
            >
              {editing ? (lang === 'en' ? 'Cancel' : 'रद्द करें') : (lang === 'en' ? 'Edit' : 'संपादित करें')}
            </button>
          </div>

          <div className="space-y-3">
            {[
              { key: 'name', label: t.name, type: 'text', placeholder: lang === 'en' ? 'Your full name' : 'आपका पूरा नाम' },
              { key: 'email', label: t.email, type: 'email', placeholder: 'email@example.com' },
              { key: 'dateOfBirth', label: lang === 'en' ? 'Date of Birth' : 'जन्म तिथि', type: 'date' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs text-gray-500 font-medium">{field.label}</label>
                {editing ? (
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="input-field mt-1"
                  />
                ) : (
                  <p className="text-sm text-gray-800 mt-1">
                    {form[field.key] || <span className="text-gray-400">{lang === 'en' ? 'Not set' : 'सेट नहीं'}</span>}
                  </p>
                )}
              </div>
            ))}

            {editing && (
              <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
                {saving ? '...' : t.saveProfile}
              </button>
            )}
          </div>
        </div>

        {/* Tier Perks */}
        <div className="kashi-card p-4">
          <h3 className="font-semibold text-saffron-900 mb-3">
            {lang === 'en' ? `Your ${tier} Tier Perks` : `आपके ${tier} टीयर के फायदे`}
          </h3>
          <ul className="space-y-2">
            {TIER_PERKS[tier].map(perk => (
              <li key={perk} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">✓</span> {perk}
              </li>
            ))}
          </ul>
          {tier !== 'PLATINUM' && (
            <p className="text-xs text-saffron-600 mt-3 font-medium">
              {lang === 'en'
                ? `Earn more points to unlock the next tier!`
                : 'अगला टीयर अनलॉक करने के लिए और अंक कमाएं!'}
            </p>
          )}
        </div>

        {/* Member info */}
        <div className="kashi-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t.memberSince}</span>
            <span className="font-medium text-saffron-800">
              {user?.memberSince ? new Date(user.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '-'}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">{lang === 'en' ? 'Member ID' : 'सदस्य आईडी'}</span>
            <span className="font-mono text-xs text-gray-600">{user?.id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm active:scale-95 transition-all"
        >
          {t.logout}
        </button>

        <div className="text-center text-xs text-gray-400 pb-2">
          Kashi Eternal Rewards v1.0 · 🙏 Har Har Mahadev
        </div>
      </div>
    </Layout>
  );
}

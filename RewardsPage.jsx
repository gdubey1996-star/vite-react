import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

const CATEGORY_ICONS = { Dining: '🍽', Stay: '🛏', Experience: '🎭', Festival: '🪔', Spa: '💆', Other: '🎁' };

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const { user, fetchProfile } = useAuth();
  const { t, lang } = useLang();

  const categories = ['ALL', 'Dining', 'Stay', 'Experience', 'Festival'];

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const { data } = await api.get('/rewards?limit=20');
      setRewards(data.rewards || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (user.points < reward.pointsRequired) {
      setMessage(`Need ${reward.pointsRequired - user.points} more points`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!window.confirm(`Redeem "${reward.name}" for ${reward.pointsRequired} points?`)) return;

    setRedeeming(reward._id);
    try {
      const { data } = await api.post('/transaction/redeem', { rewardId: reward._id });
      if (data.success) {
        setMessage(t.redeemSuccess + ' ' + reward.name);
        fetchProfile();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || t.error);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setRedeeming(null);
    }
  };

  const filtered = filter === 'ALL' ? rewards : rewards.filter(r => r.category === filter);

  return (
    <Layout title={t.rewards}>
      <div className="animate-fade-in space-y-4">

        {/* Points Balance */}
        <div className="kashi-card p-4 flex items-center justify-between bg-gradient-to-r from-saffron-50 to-amber-50">
          <div>
            <p className="text-xs text-gray-500">{t.yourBalance}</p>
            <p className="text-2xl font-bold font-display text-saffron-800">
              {(user?.points || 0).toLocaleString('en-IN')} pts
            </p>
          </div>
          <div className="text-4xl">✨</div>
        </div>

        {/* Toast Message */}
        {message && (
          <div className="kashi-card p-3 text-center text-sm font-medium text-saffron-800 border-saffron-300 bg-saffron-50 animate-slide-up">
            {message}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-saffron-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat === 'ALL' ? (lang === 'en' ? 'All' : 'सभी') : `${CATEGORY_ICONS[cat]} ${t.categories[cat] || cat}`}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="shimmer h-40 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🎁</div>
            <p>{lang === 'en' ? 'No rewards available' : 'कोई रिवार्ड उपलब्ध नहीं'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(reward => {
              const canRedeem = user?.points >= reward.pointsRequired;
              const isRedeeming = redeeming === reward._id;

              return (
                <div key={reward._id} className={`kashi-card p-4 ${reward.featured ? 'border-amber-300 border-2' : ''}`}>
                  {reward.featured && (
                    <div className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                      ⭐ {lang === 'en' ? 'Featured Reward' : 'फीचर्ड रिवार्ड'}
                    </div>
                  )}

                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-saffron-100 to-amber-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {CATEGORY_ICONS[reward.category]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {lang === 'hi' && reward.nameHindi ? reward.nameHindi : reward.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {lang === 'hi' && reward.descriptionHindi ? reward.descriptionHindi : reward.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-saffron-100 text-saffron-700 px-2 py-0.5 rounded-full">
                          {reward.property === 'ALL' ? (lang === 'en' ? 'All Properties' : 'सभी संपत्तियां') : reward.property}
                        </span>
                        {reward.validTill && (
                          <span className="text-xs text-gray-400">
                            Till {new Date(reward.validTill).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold font-display text-saffron-700">
                        {reward.pointsRequired.toLocaleString('en-IN')} pts
                      </p>
                      {!canRedeem && (
                        <p className="text-xs text-red-400">
                          {lang === 'en'
                            ? `Need ${(reward.pointsRequired - user.points).toLocaleString('en-IN')} more`
                            : `${(reward.pointsRequired - user.points).toLocaleString('en-IN')} अंक और चाहिए`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canRedeem || isRedeeming}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        canRedeem
                          ? 'bg-gradient-to-r from-saffron-500 to-amber-500 text-white shadow-md active:scale-95'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isRedeeming ? '...' : t.redeemNow}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How to earn */}
        <div className="kashi-card p-4 bg-saffron-50">
          <h3 className="font-semibold text-saffron-800 text-sm mb-2">
            💡 {lang === 'en' ? 'How to Earn Points' : 'अंक कैसे कमाएं'}
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• {lang === 'en' ? '10 points per ₹100 spent at any property' : '₹100 खर्च पर 10 अंक'}</li>
            <li>• {lang === 'en' ? 'Silver tier: +10% bonus points' : 'सिल्वर: +10% बोनस'}</li>
            <li>• {lang === 'en' ? 'Gold tier: +25% bonus points' : 'गोल्ड: +25% बोनस'}</li>
            <li>• {lang === 'en' ? 'Platinum tier: +50% bonus points' : 'प्लैटिनम: +50% बोनस'}</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

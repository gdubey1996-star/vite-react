import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import TierProgressRing from '../components/TierProgressRing';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

const TIER_LABELS = { ETERNAL: '⚡ Eternal', SILVER: '⭐ Silver', GOLD: '🌟 Gold', PLATINUM: '💎 Platinum' };
const TIER_BG = {
  ETERNAL: 'from-gray-400 to-gray-500',
  SILVER: 'from-gray-300 to-gray-400',
  GOLD: 'from-yellow-400 to-amber-500',
  PLATINUM: 'from-purple-400 to-purple-600',
};

const TX_ICONS = { EARN: '✅', REDEEM: '🎁', WELCOME: '🎉', BONUS: '⭐', ADMIN_CREDIT: '👑', ADMIN_DEBIT: '🔻' };

export default function DashboardPage() {
  const { user, fetchProfile } = useAuth();
  const { t, lang } = useLang();
  const [transactions, setTransactions] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, offersRes] = await Promise.all([
          api.get('/user/transactions?limit=5'),
          api.get('/user/offers'),
        ]);
        setTransactions(txRes.data.transactions || []);
        setOffers(offersRes.data.offers || []);
      } finally {
        setLoading(false);
      }
    };
    load();
    fetchProfile();
  }, []);

  if (!user) return null;

  const tier = user.tier || 'ETERNAL';
  const progress = user.tierProgress?.progress || 0;
  const nextTier = user.nextTier;

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">

        {/* Hero Card */}
        <div className={`rounded-2xl p-5 bg-gradient-to-br ${TIER_BG[tier]} text-white shadow-lg`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-medium">
                {t.welcomeBack}, {user.name || lang === 'en' ? 'Guest' : 'अतिथि'} 🙏
              </p>
              <h2 className="text-3xl font-bold font-display mt-1">
                {(user.points || 0).toLocaleString('en-IN')}
              </h2>
              <p className="text-white/80 text-sm">{t.myPoints}</p>
            </div>
            <div className="text-right">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                {TIER_LABELS[tier]}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>{tier}</span>
                <span>{nextTier.tier}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/70 mt-1 text-center">
                {lang === 'en'
                  ? `${(nextTier.minPoints - user.lifetimePoints).toLocaleString('en-IN')} points to ${nextTier.tier}`
                  : `${nextTier.tier} के लिए ${(nextTier.minPoints - user.lifetimePoints).toLocaleString('en-IN')} अंक और चाहिए`}
              </p>
            </div>
          )}
          {!nextTier && (
            <p className="text-white/80 text-sm text-center mt-2">
              {lang === 'en' ? '💎 Maximum tier achieved!' : '💎 सर्वोच्च टीयर प्राप्त!'}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🎁', label: t.rewards, to: '/rewards' },
            { icon: '📲', label: t.qrCode, to: '/qr' },
            { icon: '📋', label: t.transactions, to: '/transactions' },
          ].map(({ icon, label, to }) => (
            <Link key={to} to={to}
              className="kashi-card p-4 text-center hover:bg-saffron-50 transition-colors active:scale-95 transform"
            >
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-xs font-medium text-saffron-800">{label}</div>
            </Link>
          ))}
        </div>

        {/* Offers */}
        {offers.length > 0 && (
          <div>
            <h3 className="font-display font-semibold text-saffron-900 mb-2 text-sm">
              {lang === 'en' ? '✨ Personalized Offers' : '✨ व्यक्तिगत ऑफर'}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {offers.map((offer, idx) => (
                <div key={idx} className="kashi-card p-4 flex-shrink-0 w-56 border-l-4 border-saffron-400">
                  <div className="text-2xl mb-2">{offer.icon}</div>
                  <h4 className="font-semibold text-saffron-900 text-sm">
                    {lang === 'hi' && offer.titleHindi ? offer.titleHindi : offer.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{offer.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties */}
        <div>
          <h3 className="font-display font-semibold text-saffron-900 mb-2 text-sm">
            {lang === 'en' ? '🏨 Our Properties' : '🏨 हमारी संपत्तियां'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Hotel Raghukul Grand', icon: '🏨', color: 'bg-amber-50 border-amber-200' },
              { name: 'Eternal Kashi', icon: '🌅', color: 'bg-orange-50 border-orange-200' },
              { name: 'Basil Leaf', icon: '🌿', color: 'bg-green-50 border-green-200' },
              { name: 'Annapurnam', icon: '🍽', color: 'bg-red-50 border-red-200' },
            ].map(p => (
              <div key={p.name} className={`${p.color} border rounded-xl p-3 text-center`}>
                <div className="text-2xl mb-1">{p.icon}</div>
                <div className="text-xs font-medium text-gray-700">{p.name}</div>
                <div className="text-xs text-saffron-600 mt-0.5">
                  {lang === 'en' ? '10 pts / ₹100' : '₹100 पर 10 अंक'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold text-saffron-900 text-sm">{t.recentTransactions}</h3>
            <Link to="/transactions" className="text-xs text-saffron-600">{lang === 'en' ? 'View all →' : 'सब देखें →'}</Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="shimmer h-14 rounded-xl" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="kashi-card p-6 text-center text-gray-400 text-sm">
              {t.noTransactions}
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx._id} className="kashi-card p-3 flex items-center gap-3">
                  <div className="text-2xl">{TX_ICONS[tx.type] || '💫'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400">{tx.property} · {new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className={`text-sm font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

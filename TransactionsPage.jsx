import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

const TX_ICONS = { EARN: '✅', REDEEM: '🎁', WELCOME: '🎉', BONUS: '⭐', ADMIN_CREDIT: '👑', ADMIN_DEBIT: '🔻', EXPIRE: '⏰' };
const TX_COLORS = { EARN: 'text-green-600', REDEEM: 'text-red-500', WELCOME: 'text-purple-600', BONUS: 'text-amber-600', ADMIN_CREDIT: 'text-blue-600', ADMIN_DEBIT: 'text-red-600', EXPIRE: 'text-gray-400' };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const { lang, t } = useLang();

  useEffect(() => {
    loadTransactions(1);
  }, []);

  const loadTransactions = async (pg) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/user/transactions?page=${pg}&limit=15`);
      if (pg === 1) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions(prev => [...prev, ...(data.transactions || [])]);
      }
      setTotal(data.pagination?.total || 0);
      setHasMore(pg < data.pagination?.pages);
      setPage(pg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Group by date
  const grouped = transactions.reduce((acc, tx) => {
    const key = formatDate(tx.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <Layout title={t.transactions}>
      <div className="animate-fade-in space-y-4">

        {/* Summary */}
        <div className="kashi-card p-4 bg-gradient-to-r from-saffron-50 to-amber-50">
          <p className="text-xs text-gray-500 mb-1">
            {lang === 'en' ? 'Total Transactions' : 'कुल लेनदेन'}
          </p>
          <p className="text-2xl font-bold font-display text-saffron-800">{total}</p>
        </div>

        {/* Transactions List */}
        {loading && page === 1 ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-400">{t.noTransactions}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                <p className="text-xs text-gray-400 font-semibold mb-2 px-1">{date}</p>
                <div className="space-y-2">
                  {txs.map(tx => (
                    <div key={tx._id} className="kashi-card p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-saffron-50 flex items-center justify-center text-xl flex-shrink-0">
                        {TX_ICONS[tx.type] || '💫'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400">{tx.property}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-xs text-gray-400">{formatTime(tx.createdAt)}</p>
                          {tx.amountSpent > 0 && (
                            <>
                              <span className="text-gray-300">·</span>
                              <p className="text-xs text-gray-400">₹{tx.amountSpent.toLocaleString('en-IN')}</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-bold ${TX_COLORS[tx.type] || 'text-gray-600'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </div>
                        <div className="text-xs text-gray-400">
                          Bal: {tx.balanceAfter}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => loadTransactions(page + 1)}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-saffron-200 text-saffron-700 text-sm font-medium"
              >
                {loading ? t.loading : (lang === 'en' ? 'Load More' : 'और लोड करें')}
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

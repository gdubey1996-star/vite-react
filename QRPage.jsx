import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

const TIER_LABELS = { ETERNAL: '⚡ Eternal', SILVER: '⭐ Silver', GOLD: '🌟 Gold', PLATINUM: '💎 Platinum' };
const TIER_COLORS = { ETERNAL: '#6B7280', SILVER: '#9CA3AF', GOLD: '#D97706', PLATINUM: '#8B5CF6' };

export default function QRPage() {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    loadQR();
  }, []);

  const loadQR = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/qr/generate');
      if (data.success) setQrData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  const tierColor = TIER_COLORS[user?.tier] || '#6B7280';

  return (
    <Layout title={t.qrCode}>
      <div className="animate-fade-in space-y-4">

        {/* Main QR Card */}
        <div className="kashi-card p-6 text-center">
          {/* Header */}
          <div className="text-2xl mb-1">🪔</div>
          <h2 className="font-display text-xl font-bold text-saffron-900 mb-1">
            {user?.name || (lang === 'en' ? 'Guest' : 'अतिथि')}
          </h2>
          <p className="text-sm text-gray-500 mb-1">+91 {user?.phone}</p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: tierColor }}
            >
              {TIER_LABELS[user?.tier]}
            </span>
            <span className="text-sm font-bold text-saffron-700">
              {(user?.points || 0).toLocaleString('en-IN')} pts
            </span>
          </div>

          {/* QR Code */}
          {loading ? (
            <div className="shimmer w-64 h-64 rounded-2xl mx-auto" />
          ) : error ? (
            <div className="text-red-400 text-sm py-8">{error}</div>
          ) : qrData ? (
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-saffron-100 inline-block">
                <QRCodeSVG
                  value={qrData.payload}
                  size={220}
                  bgColor="#FFFFFF"
                  fgColor="#78350F"
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Lotus decoration */}
              <div className="flex items-center gap-2 mt-4 text-saffron-300">
                <div className="h-px w-12 bg-saffron-200" />
                <span className="text-lg">🪷</span>
                <div className="h-px w-12 bg-saffron-200" />
              </div>
            </div>
          ) : null}

          <p className="text-sm text-gray-500 mt-3">
            {t.showQrAtCounter}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t.scanToEarn}</p>
        </div>

        {/* Refresh */}
        <button
          onClick={loadQR}
          disabled={loading}
          className="w-full py-3 rounded-xl border-2 border-saffron-300 text-saffron-700 font-semibold text-sm hover:bg-saffron-50 active:scale-95 transition-all"
        >
          🔄 {lang === 'en' ? 'Refresh QR Code' : 'QR कोड रिफ्रेश करें'}
        </button>

        {/* Earn Info */}
        <div className="kashi-card p-4">
          <h3 className="font-semibold text-sm text-saffron-900 mb-3">
            {lang === 'en' ? '💡 How it works' : '💡 यह कैसे काम करता है'}
          </h3>
          <div className="space-y-3">
            {[
              { icon: '1️⃣', en: 'Show QR code at hotel/restaurant counter', hi: 'होटल/रेस्तरां काउंटर पर QR कोड दिखाएं' },
              { icon: '2️⃣', en: 'Staff scans your QR and enters bill amount', hi: 'स्टाफ QR स्कैन करके बिल राशि डालता है' },
              { icon: '3️⃣', en: 'Points are credited instantly to your account', hi: 'अंक तुरंत आपके खाते में क्रेडिट होते हैं' },
              { icon: '4️⃣', en: 'Redeem points for rewards anytime', hi: 'कभी भी रिवार्ड्स के लिए अंक रिडीम करें' },
            ].map(step => (
              <div key={step.icon} className="flex gap-3 items-start">
                <span className="text-xl">{step.icon}</span>
                <p className="text-sm text-gray-600">{lang === 'hi' ? step.hi : step.en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Printable table-tent hint */}
        <div className="kashi-card p-3 text-center bg-amber-50 border-amber-200">
          <p className="text-xs text-amber-700">
            🖨️ {lang === 'en'
              ? 'Ask staff to print your QR for table-top display'
              : 'टेबल पर रखने के लिए स्टाफ से QR प्रिंट करवाएं'}
          </p>
        </div>
      </div>
    </Layout>
  );
}

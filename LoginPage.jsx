import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const { login } = useAuth();
  const { t, toggleLang, lang } = useLang();
  const navigate = useNavigate();

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/send-otp', { phone });
      if (data.success) {
        setStep('otp');
        startCountdown();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { setError('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp: otpStr });
      if (data.success) {
        login(data.token, data.user);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (newOtp.every(d => d) && val) setTimeout(verifyOTP, 100);
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen mandir-bg flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 safe-top">
        <div></div>
        <button
          onClick={toggleLang}
          className="text-saffron-700 font-medium text-sm border border-saffron-300 px-3 py-1 rounded-full"
        >
          {t.language}
        </button>
      </div>

      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-3">🪔</div>
          <h1 className="font-display text-3xl font-bold text-saffron-900 leading-tight">
            {t.appName}
          </h1>
          <p className="text-saffron-600 mt-2 text-sm">
            {lang === 'en'
              ? 'Earn rewards across Kashi\'s finest hospitality brands'
              : 'काशी के श्रेष्ठ आतिथ्य ब्रांड्स में पुरस्कार अर्जित करें'}
          </p>

          {/* Properties */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['🏨 Raghukul Grand', '🌅 Eternal Kashi', '🌿 Basil Leaf', '🍽 Annapurnam'].map(p => (
              <span key={p} className="text-xs bg-saffron-100 text-saffron-800 px-2 py-1 rounded-full border border-saffron-200">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="kashi-card p-6 w-full max-w-sm animate-slide-up">
          {step === 'phone' ? (
            <>
              <h2 className="font-display text-xl font-semibold text-saffron-900 mb-1">
                {lang === 'en' ? 'Sign In' : 'साइन इन करें'}
              </h2>
              <p className="text-gray-500 text-sm mb-5">{t.enterPhone}</p>

              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={e => e.key === 'Enter' && sendOTP()}
                  className="input-field pl-12"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <button onClick={sendOTP} disabled={loading} className="btn-primary">
                {loading ? t.sending : t.sendOtp}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                {lang === 'en'
                  ? 'New users get 100 welcome points 🎁'
                  : 'नए यूजर को 100 स्वागत अंक मिलते हैं 🎁'}
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('phone'); setError(''); setOtp(['', '', '', '', '', '']); }}
                className="text-saffron-600 text-sm mb-4 flex items-center gap-1"
              >
                ← {lang === 'en' ? 'Change number' : 'नंबर बदलें'}
              </button>

              <h2 className="font-display text-xl font-semibold text-saffron-900 mb-1">
                {t.verifyOtp}
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                {t.otpSent} <span className="font-medium text-saffron-800">+91 {phone}</span>
              </p>

              {/* OTP Inputs */}
              <div className="flex gap-2 justify-center mb-5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className="otp-input"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

              <button onClick={verifyOTP} disabled={loading} className="btn-primary mb-3">
                {loading ? t.verifying : t.verifyOtp}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-400 text-sm">
                    {lang === 'en' ? `Resend in ${countdown}s` : `${countdown} सेकंड में दोबारा भेजें`}
                  </p>
                ) : (
                  <button onClick={sendOTP} className="text-saffron-600 text-sm font-medium">
                    {t.resendOtp}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Dev hint */}
        {import.meta.env.DEV && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            Dev: OTP logged in server console
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-xs text-gray-400 safe-bottom">
        <div className="mb-1">🙏 Har Har Mahadev</div>
        Kashi Eternal Rewards © 2024
      </div>
    </div>
  );
}

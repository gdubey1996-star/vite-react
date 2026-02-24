import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../utils/api';

const TABS = ['Dashboard', 'Users', 'Transactions', 'Rewards', 'Campaigns', 'Upload CSV'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [newReward, setNewReward] = useState({ name: '', description: '', pointsRequired: '', property: 'ALL', category: 'Dining', minTier: 'ETERNAL' });
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem('ker_admin') || '{}');

  useEffect(() => {
    if (tab === 'Dashboard') loadAnalytics();
    else if (tab === 'Users') loadUsers();
    else if (tab === 'Transactions') loadTransactions();
    else if (tab === 'Rewards') loadRewards();
    else if (tab === 'Campaigns') loadCampaigns();
  }, [tab]);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/dashboard');
      setAnalytics(data.analytics);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin/login'); }
    } finally { setLoading(false); }
  };

  const loadUsers = async (search = '') => {
    setLoading(true);
    try {
      const { data } = await adminApi.get(`/admin/users?search=${search}&limit=30`);
      setUsers(data.users || []);
    } finally { setLoading(false); }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/transactions?limit=50');
      setTransactions(data.transactions || []);
    } finally { setLoading(false); }
  };

  const loadRewards = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/rewards');
      setRewards(data.rewards || []);
    } finally { setLoading(false); }
  };

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/campaigns');
      setCampaigns(data.campaigns || []);
    } finally { setLoading(false); }
  };

  const handleCreditPoints = async (userId, currentBalance) => {
    const points = prompt(`Current balance: ${currentBalance}\nEnter points to add (negative to deduct):`);
    const reason = points ? prompt('Reason for adjustment:') : null;
    if (!points || !reason) return;
    try {
      await adminApi.post(`/admin/users/${userId}/credit`, { points, reason });
      showMsg(`Points updated successfully`);
      loadUsers(searchUser);
    } catch (err) { showMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateReward = async () => {
    if (!newReward.name || !newReward.pointsRequired) { showMsg('Name and points required'); return; }
    try {
      await adminApi.post('/admin/rewards', { ...newReward, pointsRequired: parseInt(newReward.pointsRequired) });
      showMsg('Reward created!');
      setNewReward({ name: '', description: '', pointsRequired: '', property: 'ALL', category: 'Dining', minTier: 'ETERNAL' });
      loadRewards();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleToggleReward = async (id, isActive) => {
    try {
      await adminApi.put(`/admin/rewards/${id}`, { isActive: !isActive });
      showMsg(`Reward ${isActive ? 'deactivated' : 'activated'}`);
      loadRewards();
    } catch { showMsg('Failed'); }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const { data } = await adminApi.post('/admin/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showMsg(`Processed: ${data.results?.success} success, ${data.results?.failed} failed`);
    } catch (err) { showMsg(err.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); e.target.value = ''; }
  };

  const logout = () => {
    localStorage.removeItem('ker_admin_token');
    localStorage.removeItem('ker_admin');
    navigate('/admin/login');
  };

  const StatCard = ({ label, value, icon }) => (
    <div className="bg-white rounded-xl p-4 border border-saffron-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold font-display text-saffron-800 mt-1">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-saffron-800 to-amber-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div>
            <h1 className="font-display font-bold text-lg">🪔 KER Admin</h1>
            <p className="text-white/70 text-xs">{admin.name} · {admin.role}</p>
          </div>
          <button onClick={logout} className="text-white/80 text-sm hover:text-white border border-white/30 px-3 py-1 rounded-full">
            Logout
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex overflow-x-auto border-t border-white/20 max-w-7xl mx-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium transition-colors ${
                tab === t ? 'bg-white/20 text-white border-b-2 border-white' : 'text-white/70 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Message */}
        {message && (
          <div className="mb-4 p-3 bg-saffron-50 border border-saffron-200 rounded-xl text-sm text-saffron-800 font-medium">
            {message}
          </div>
        )}

        {/* Dashboard Tab */}
        {tab === 'Dashboard' && (
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="shimmer h-24 rounded-xl" />)}
              </div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Total Members" value={analytics.totalUsers?.toLocaleString('en-IN')} icon="👥" />
                  <StatCard label="Active (This Month)" value={analytics.activeThisMonth?.toLocaleString('en-IN')} icon="📈" />
                  <StatCard label="Points Issued" value={(analytics.totalPointsIssued / 1000).toFixed(1) + 'K'} icon="✅" />
                  <StatCard label="Points Redeemed" value={(analytics.totalPointsRedeemed / 1000).toFixed(1) + 'K'} icon="🎁" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Monthly Points" value={(analytics.monthlyPointsEarned / 1000).toFixed(1) + 'K'} icon="📅" />
                  <StatCard label="Repeat Visit Rate" value={analytics.repeatVisitRate + '%'} icon="🔄" />
                </div>

                {/* Tier Distribution */}
                <div className="bg-white rounded-xl p-4 border border-saffron-100">
                  <h3 className="font-semibold text-saffron-900 mb-3">Tier Distribution</h3>
                  <div className="space-y-2">
                    {analytics.tierDistribution?.map(t => (
                      <div key={t._id} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 w-16">{t._id}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-saffron-400 to-amber-400 rounded-full flex items-center px-2"
                            style={{ width: `${Math.min(100, (t.count / analytics.totalUsers) * 100)}%` }}
                          >
                            <span className="text-xs text-white font-semibold">{t.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Stats */}
                {analytics.propertyStats?.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-saffron-100">
                    <h3 className="font-semibold text-saffron-900 mb-3">Property Performance</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 border-b">
                            <th className="text-left py-2">Property</th>
                            <th className="text-right py-2">Txns</th>
                            <th className="text-right py-2">Points</th>
                            <th className="text-right py-2">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.propertyStats.map(p => (
                            <tr key={p._id} className="border-b border-gray-50">
                              <td className="py-2 font-medium text-gray-800 text-xs">{p._id}</td>
                              <td className="py-2 text-right text-gray-600">{p.count}</td>
                              <td className="py-2 text-right text-saffron-600 font-semibold">{p.totalPoints?.toLocaleString('en-IN')}</td>
                              <td className="py-2 text-right text-green-600">₹{(p.totalSpent / 1000).toFixed(1)}K</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Top Redeemers */}
                {analytics.topRedeemers?.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-saffron-100">
                    <h3 className="font-semibold text-saffron-900 mb-3">Top Members</h3>
                    <div className="space-y-2">
                      {analytics.topRedeemers.map((u, idx) => (
                        <div key={u._id} className="flex items-center gap-3">
                          <span className="text-lg">{['🥇','🥈','🥉','4️⃣','5️⃣'][idx] || `${idx+1}.`}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{u.name || 'Guest'}</p>
                            <p className="text-xs text-gray-400">{u.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-saffron-700">{u.lifetimePoints?.toLocaleString('en-IN')} pts</p>
                            <p className="text-xs text-gray-400">{u.tier}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'Users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by phone or name..."
                value={searchUser}
                onChange={e => { setSearchUser(e.target.value); loadUsers(e.target.value); }}
                className="input-field"
              />
            </div>
            <div className="bg-white rounded-xl border border-saffron-100 overflow-hidden">
              {loading ? <div className="shimmer h-64" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-saffron-50 text-xs text-saffron-800">
                      <tr>
                        <th className="text-left p-3">Member</th>
                        <th className="text-right p-3">Points</th>
                        <th className="text-center p-3">Tier</th>
                        <th className="text-right p-3">Visits</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-gray-50 hover:bg-saffron-50/50">
                          <td className="p-3">
                            <p className="font-medium text-gray-800">{u.name || 'No name'}</p>
                            <p className="text-xs text-gray-400">{u.phone}</p>
                          </td>
                          <td className="p-3 text-right font-semibold text-saffron-700">{u.points?.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-center">
                            <span className="text-xs bg-saffron-100 text-saffron-700 px-2 py-0.5 rounded-full">{u.tier}</span>
                          </td>
                          <td className="p-3 text-right text-gray-500">{u.visitCount}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleCreditPoints(u._id, u.points)}
                              className="text-xs bg-saffron-100 text-saffron-700 px-2 py-1 rounded-lg hover:bg-saffron-200"
                            >
                              Adjust Points
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {tab === 'Transactions' && (
          <div className="bg-white rounded-xl border border-saffron-100 overflow-hidden">
            {loading ? <div className="shimmer h-64" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-saffron-50 text-xs text-saffron-800">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Member</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3">Points</th>
                      <th className="text-right p-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx._id} className="border-b border-gray-50 hover:bg-saffron-50/30">
                        <td className="p-3 text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-3">
                          <p className="text-xs font-medium">{tx.userId?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-400">{tx.phone}</p>
                        </td>
                        <td className="p-3 text-xs text-gray-600 max-w-xs truncate">{tx.description}</td>
                        <td className={`p-3 text-right font-semibold text-xs ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </td>
                        <td className="p-3 text-right text-xs text-gray-500">{tx.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {tab === 'Rewards' && (
          <div className="space-y-4">
            {/* Create Reward */}
            <div className="bg-white rounded-xl p-4 border border-saffron-100">
              <h3 className="font-semibold text-saffron-900 mb-3">Create New Reward</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Reward name *" value={newReward.name} onChange={e => setNewReward(p => ({...p, name: e.target.value}))} className="input-field" />
                <input type="number" placeholder="Points required *" value={newReward.pointsRequired} onChange={e => setNewReward(p => ({...p, pointsRequired: e.target.value}))} className="input-field" />
                <input placeholder="Description" value={newReward.description} onChange={e => setNewReward(p => ({...p, description: e.target.value}))} className="input-field" />
                <select value={newReward.property} onChange={e => setNewReward(p => ({...p, property: e.target.value}))} className="input-field">
                  <option value="ALL">All Properties</option>
                  <option>Hotel Raghukul Grand</option>
                  <option>Eternal Kashi</option>
                  <option>Basil Leaf</option>
                  <option>Annapurnam Restaurant</option>
                </select>
                <select value={newReward.category} onChange={e => setNewReward(p => ({...p, category: e.target.value}))} className="input-field">
                  {['Dining','Stay','Experience','Festival','Spa','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={newReward.minTier} onChange={e => setNewReward(p => ({...p, minTier: e.target.value}))} className="input-field">
                  {['ETERNAL','SILVER','GOLD','PLATINUM'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={handleCreateReward} className="btn-primary mt-3">Create Reward</button>
            </div>

            {/* Rewards List */}
            {loading ? <div className="shimmer h-48 rounded-xl" /> : (
              <div className="space-y-2">
                {rewards.map(r => (
                  <div key={r._id} className="bg-white rounded-xl p-3 border border-saffron-100 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.property} · {r.category} · {r.pointsRequired} pts · {r.minTier}+</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => handleToggleReward(r._id, r.isActive)}
                        className="text-xs text-saffron-600 hover:underline">
                        {r.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload CSV Tab */}
        {tab === 'Upload CSV' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-saffron-100 text-center">
              <div className="text-5xl mb-3">📊</div>
              <h3 className="font-semibold text-saffron-900 mb-2">Bulk Transaction Upload</h3>
              <p className="text-sm text-gray-500 mb-4">Upload CSV with columns: phone, amount, property</p>

              <div className="bg-gray-50 rounded-xl p-4 text-left text-xs font-mono text-gray-600 mb-4">
                phone,amount,property<br />
                9876543210,1500,Basil Leaf<br />
                9876543211,3000,Hotel Raghukul Grand
              </div>

              <label className="btn-primary cursor-pointer inline-block">
                {loading ? 'Processing...' : '📁 Choose CSV File'}
                <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} disabled={loading} />
              </label>

              <div className="mt-6 text-left">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Valid Properties:</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  {['Hotel Raghukul Grand', 'Eternal Kashi', 'Basil Leaf', 'Annapurnam Restaurant'].map(p => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Campaigns */}
            <div className="bg-white rounded-xl p-4 border border-saffron-100">
              <h3 className="font-semibold text-saffron-900 mb-2">POS Integration</h3>
              <p className="text-xs text-gray-500 mb-3">Use POS API for real-time transactions (Rannkly / PetPooja)</p>
              <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-700">
                <p className="text-saffron-600 font-semibold">POST /api/transaction</p>
                <p className="mt-1">Headers: x-api-key: YOUR_POS_API_KEY</p>
                <p className="mt-1">{'{'}</p>
                <p>&nbsp;&nbsp;"phone": "9876543210",</p>
                <p>&nbsp;&nbsp;"amount": 1500,</p>
                <p>&nbsp;&nbsp;"property": "Basil Leaf"</p>
                <p>{'}'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

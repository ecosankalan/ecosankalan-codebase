import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import { getMyVouchers, unlockVoucher, getProfile } from '../services/api';
import '../styles/vouchers.css';

const REWARD_CATS = ['All Rewards', 'Shopping', 'Lifestyle', 'Dining'];

// Available partner rewards (seeded in DB — these come from getProducts in production)
// Shown as "unlock" offers; actual voucher pool lives in admin
const PARTNER_REWARDS = [
  { id: 'amazon',    brand: 'Amazon',    title: 'Amazon Gift Card',  pts: 500, cat: 'Shopping',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRN66bMEtk3jyEw9jXSCL0dI3iF7YarH1M6EH54hTvdGqDxilYCH_pehM_qJ9XoEj10Dvb2q2I_xthOm8aDa9rCeL9xP9kgIfDt25xiXUzkSuAznLw3YFzcwvhvC0PDbKbJsW2r-0AGvf5GX71NDLpkJnArLOb63S_h27jY-RmB2YZ3GyPTbkriZ-uRp1ZnsZgJa03K093k3bUBYEs_EMjn0nK1qTupCDQVE_cz5IKSkHai68UDrQaBtQ9b_0XVEnpSm521HDTYSfh',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuNwp13D2GVapRliA0KsLo4B-Os1eyfKpeWvvHYzVH557YZ-v2TjydkdfZ2JjBatHbXU_KZChdz3E4eeW9AMey4ctP0MkWZkIyjol8SKKJVTqO0FvbL75qP5UeTBDvE0SnPdLjPEV710IlanlS1f2E5m2V6xThYaSXdpyZQ9HjFMVYWtzPMnmwxkZ_M0IaOSx7VX5UCF7sxSrAyqOEiu5ZRaEAvff5ukn8rnX1pD4eLyOZCuovbDBFy9IS8Ulyrjmd-GDkbJniRuA5' },
  { id: 'decathlon', brand: 'Decathlon', title: 'Store Voucher',     pts: 800, cat: 'Shopping',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpR48hLT5AZJqWGugj7UmHGUrcMhBEY7Ut_aWa3KXiIvCkOWE8NcbJewBVWiQGHYl8atJAqyEGJK9G_2BeDdjo28_YE_HG59-gKvysnGJIclzT-73XFfU1Hs_0Xm0qBN-PAmbC0XlxEWlPTHUhUcP--Dr5BSo7ba4lmJC6t8W7z8LEQuTaMm-XwzndqwC1pydyghRKtz6L_sT_BSpYsNW7NTPsOPwD-IIWWoNDrtm1nhf9XaZz8dJCC_vT2kLazMKlmi5BADXRSrmJ',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHlbudSqV7DRX5ag4LK5dxcG3oNWtDupwbLbkkPr3vPkSEzHCWeAw1eA3pvTyO_UWwTAug_LQF2RBrih4Qpgd-kxZ5rt7zw3uS8WOaxCQaxaAxv0lVeNdiHxVrjObDaC7u4ZbngKwIJYn75BO1KaLxOmK8WeNTvy9Zc9Hkjm2vI4L4LiRwAd_AwtfTn9k3-CuCj1riMCFA2elGDXu_IZlLjYScaKocck7hNrmt-Igr1x5lJCi1qnjcNJpIcUXhGxY6sVouPvk8v6mJ' },
  { id: 'starbucks', brand: 'Starbucks', title: 'Free Drink Reward', pts: 1200, cat: 'Dining',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlPWrd1G0npg71wkuQ1K0qKVlDxlAjyKAW9LkapTKotSZDaVs-Tim4Mdp1yXsZGKxvBAmIekDAqTG5ybRoRbk3iurkrht57SV8_TsjK57_p9MZxbG8nTDqagP4mMWn3p0DXT5FllTR5tIyPsACj7wQ7qYUvKYRoEOIe1Z2iLlWvPcjTPccgY7p_oZ8LaNoiuopXAkb5NP8AfFUal2Do9xqWrfKyIAPJ-ZNgAXKjb0HUrYuKKe1p5JltKnjSlnx08Zofp7tTDbRRqNw',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNBBOAgvmskc870s7b-lfvLlv_6N07Tz09sNG5NwoLwKxk-30N9d589Vf_MSYCqWkov-IWUnfFkpegELqNwCKAMSrIqM6tnNDilVYBR2UCqrZsXFqd7LeroTQhJ5QNTgcdkE0Hp0spt0ooBt2NUvlPTRILmGH8ELJbxoE9pZclVsviNe6WMMwWyDxATb3I1ikt4rXeMS-x51_XcJH99qsc8j5sFhrTu9NzypxEr9ABgfNWdml5U_aJZOT0nML36rmDFwuuH1fL94W8' },
];

const formatExpiry = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `Valid until ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const maskCode = (code) => {
  if (!code) return '••••••••';
  return code.slice(0, 3) + '•'.repeat(Math.max(0, code.length - 5)) + code.slice(-2);
};

export default function VouchersPage() {
  const navigate = useNavigate();

  const [myVouchers,  setMyVouchers]  = useState([]);
  const [ecoPoints,   setEcoPoints]   = useState(0);
  const [revealed,    setRevealed]    = useState({});
  const [cat,         setCat]         = useState('All Rewards');
  const [loading,     setLoading]     = useState(true);
  const [unlocking,   setUnlocking]   = useState(null); // partnerName being unlocked
  const [error,       setError]       = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, pRes] = await Promise.all([getMyVouchers(), getProfile()]);
        setMyVouchers(vRes.data);
        setEcoPoints(pRes.data?.ecoPoints || 0);
      } catch (err) {
        setError(err.message || 'Failed to load vouchers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleReveal = (id) => setRevealed(p => ({ ...p, [id]: !p[id] }));

  const handleUnlock = async (reward) => {
    if (ecoPoints < reward.pts) {
      setError(`You need ${reward.pts} points to unlock this reward. You have ${ecoPoints}.`);
      return;
    }
    setUnlocking(reward.brand);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await unlockVoucher(reward.brand);
      setMyVouchers(prev => [data, ...prev]);
      setEcoPoints(ep => ep - (data.cost || reward.pts)); // dynamically deduct correct cost
      setSuccessMsg(`🎉 ${reward.brand} voucher unlocked! Code: ${data.code}`);
    } catch (err) {
      if (err.message?.includes('409') || err.message?.toLowerCase().includes('no voucher')) {
        setError(`No ${reward.brand} vouchers available right now. Check back soon!`);
      } else if (err.message?.toLowerCase().includes('insufficient')) {
        setError('Insufficient Eco Points to unlock this voucher.');
      } else {
        setError(err.message || 'Failed to unlock voucher');
      }
    } finally {
      setUnlocking(null);
    }
  };

  const filteredRewards = cat === 'All Rewards' ? PARTNER_REWARDS : PARTNER_REWARDS.filter(r => r.cat === cat);

  // Split vouchers into active and expired
  const now = new Date();
  const activeVouchers = myVouchers.filter(v => !v.expiresAt || new Date(v.expiresAt) > now);
  const expiredVouchers = myVouchers.filter(v => v.expiresAt && new Date(v.expiresAt) <= now);

  return (
    <div className="vr-root">
      <Navbar />
      <main className="vr-main">

        {/* Balance card */}
        <section className="vr-balance-card">
          <div className="vr-balance-bg-icon"><span className="material-symbols-outlined">eco</span></div>
          <div className="vr-balance-inner">
            <p className="vr-balance-eyebrow">Your Eco Balance</p>
            <div className="vr-balance-row">
              <span className="vr-balance-num">{loading ? '—' : ecoPoints.toLocaleString('en-IN')}</span>
              <span className="vr-balance-unit">Points</span>
            </div>
            <div className="vr-balance-badge">
              <span className="material-symbols-outlined vr-trend-icon" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              500 pts needed to unlock a reward
            </div>
          </div>
        </section>

        {/* Alerts */}
        {error && (
          <div className="vr-alert error">
            <span className="material-symbols-outlined">error</span>
            {error}
            <button onClick={() => setError('')}><span className="material-symbols-outlined">close</span></button>
          </div>
        )}
        {successMsg && (
          <div className="vr-alert success">
            <span className="material-symbols-outlined">check_circle</span>
            {successMsg}
            <button onClick={() => setSuccessMsg('')}><span className="material-symbols-outlined">close</span></button>
          </div>
        )}

        {/* My Vouchers */}
        <section className="vr-section">
          <div className="vr-section-header">
            <h2 className="vr-section-title">My Vouchers</h2>
            <span className="vr-badge-count">{activeVouchers.length} active</span>
          </div>

          {loading && (
            <div className="vr-loading">
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
              Loading vouchers…
            </div>
          )}

          {!loading && myVouchers.length === 0 && (
            <div className="vr-empty">
              <span className="material-symbols-outlined vr-empty-icon">confirmation_number</span>
              <p>No vouchers yet. Unlock one below!</p>
            </div>
          )}

          <div className="vr-vouchers-list">
            {[...activeVouchers, ...expiredVouchers].map(v => (
              <div className={`vr-voucher-card${v.expiresAt && new Date(v.expiresAt) <= now ? ' expired' : ''}`} key={v._id}>
                <div className="vr-voucher-left">
                  <div className="vr-voucher-logo-wrap">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  </div>
                  <span className="vr-voucher-brand">{v.partnerName}</span>
                </div>
                <div className="vr-voucher-dash" />
                <div className="vr-voucher-right">
                  <div>
                    <h3 className="vr-voucher-discount">{v.discountLabel || 'Voucher'}</h3>
                    <p className="vr-voucher-valid">{formatExpiry(v.expiresAt)}</p>
                  </div>
                  <div className="vr-voucher-code-row">
                    <code className="vr-voucher-code" onClick={() => toggleReveal(v._id)}>
                      {revealed[v._id] ? v.code : maskCode(v.code)}
                    </code>
                    <button className="vr-copy-btn" onClick={() => {
                      if (revealed[v._id]) {
                        navigator.clipboard.writeText(v.code);
                        setSuccessMsg('Code copied!');
                      } else {
                        toggleReveal(v._id);
                      }
                    }}>
                      <span className="material-symbols-outlined">{revealed[v._id] ? 'content_copy' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Available Rewards */}
        <section className="vr-section">
          <h2 className="vr-section-title" style={{ marginBottom: '0.75rem' }}>Available Rewards</h2>
          <div className="vr-reward-chips">
            {REWARD_CATS.map(c => (
              <button key={c} className={`vr-reward-chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="vr-rewards-list">
            {filteredRewards.map(r => (
              <div className="vr-reward-card" key={r.id}>
                <div className="vr-reward-img-wrap">
                  <img src={r.img} alt={r.title} className="vr-reward-img" />
                  <div className="vr-reward-img-overlay" />
                  <div className="vr-reward-brand-row">
                    <div className="vr-reward-brand-logo-wrap">
                      <img src={r.brandLogo} alt={r.brand} className="vr-reward-brand-logo" />
                    </div>
                    <span className="vr-reward-brand-name">{r.title}</span>
                  </div>
                </div>
                <div className="vr-reward-footer">
                  <div>
                    <p className="vr-reward-redeem-label">Redeem for</p>
                    <p className="vr-reward-pts">{r.pts} pts</p>
                  </div>
                  <button
                    className="vr-unlock-btn"
                    disabled={unlocking === r.brand || ecoPoints < r.pts}
                    onClick={() => handleUnlock(r)}
                  >
                    {unlocking === r.brand ? (
                      <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                    ) : ecoPoints < r.pts ? `Need ${r.pts - ecoPoints} more` : 'Unlock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}

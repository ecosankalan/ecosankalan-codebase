import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/vouchers.css';

const VOUCHERS = [
  { id: 1, brand: 'IKEA',      discount: '500 OFF',  valid: 'Valid until 24 Oct', code: 'ECOSANK29',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNBBOAgvmskc870s7b-lfvLlv_6N07Tz09sNG5NwoLwKxk-30N9d589Vf_MSYCqWkov-IWUnfFkpegELqNwCKAMSrIqM6tnNDilVYBR2UCqrZsXFqd7LeroTQhJ5QNTgcdkE0Hp0spt0ooBt2NUvlPTRILmGH8ELJbxoE9pZclVsviNe6WMMwWyDxATb3I1ikt4rXeMS-x51_XcJH99qsc8j5sFhrTu9NzypxEr9ABgfNWdml5U_aJZOT0nML36rmDFwuuH1fL94W8' },
  { id: 2, brand: 'Decathlon', discount: '15% OFF', valid: 'Valid until 12 Nov', code: 'ECOSANK29',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlM6mJNealfUT2z-rLv-XC9DpKoU40lAcglquS0c8NPMrt3U3R_g33OvijaSGYm0hlDFEsOXh6ctt_N5U64QxcSHcR6SCQceLxUYfLUCMU-Cy21R9p8z_jljET0hd95qDHG52v_ulhgV6hadS-EWbat9RXdgTd_XmJnEzrF3VDfZiJKfbsXrOMyfzRuCL1cT_4I0c6JMXxilKNmrqnKNHKshdfo-3RW0MxAk4fjrxGfF-2S92TZicTvBUfFmQ9uuCZtvpcuHPWQTvR' },
];

const REWARD_CATS = ['All Rewards', 'Shopping', 'Lifestyle', 'Dining'];

const REWARDS = [
  { id: 1, brand: 'Amazon',    title: 'Amazon Gift Card',  pts: 500,  cat: 'Shopping',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRN66bMEtk3jyEw9jXSCL0dI3iF7YarH1M6EH54hTvdGqDxilYCH_pehM_qJ9XoEj10Dvb2q2I_xthOm8aDa9rCeL9xP9kgIfDt25xiXUzkSuAznLw3YFzcwvhvC0PDbKbJsW2r-0AGvf5GX71NDLpkJnArLOb63S_h27jY-RmB2YZ3GyPTbkriZ-uRp1ZnsZgJa03K093k3bUBYEs_EMjn0nK1qTupCDQVE_cz5IKSkHai68UDrQaBtQ9b_0XVEnpSm521HDTYSfh',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuNwp13D2GVapRliA0KsLo4B-Os1eyfKpeWvvHYzVH557YZ-v2TjydkdfZ2JjBatHbXU_KZChdz3E4eeW9AMey4ctP0MkWZkIyjol8SKKJVTqO0FvbL75qP5UeTBDvE0SnPdLjPEV710IlanlS1f2E5m2V6xThYaSXdpyZQ9HjFMVYWtzPMnmwxkZ_M0IaOSx7VX5UCF7sxSrAyqOEiu5ZRaEAvff5ukn8rnX1pD4eLyOZCuovbDBFy9IS8Ulyrjmd-GDkbJniRuA5' },
  { id: 2, brand: 'Decathlon', title: 'Store Voucher',     pts: 800,  cat: 'Shopping',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpR48hLT5AZJqWGugj7UmHGUrcMhBEY7Ut_aWa3KXiIvCkOWE8NcbJewBVWiQGHYl8atJAqyEGJK9G_2BeDdjo28_YE_HG59-gKvysnGJIclzT-73XFfU1Hs_0Xm0qBN-PAmbC0XlxEWlPTHUhUcP--Dr5BSo7ba4lmJC6t8W7z8LEQuTaMm-XwzndqwC1pydyghRKtz6L_sT_BSpYsNW7NTPsOPwD-IIWWoNDrtm1nhf9XaZz8dJCC_vT2kLazMKlmi5BADXRSrmJ',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHlbudSqV7DRX5ag4LK5dxcG3oNWtDupwbLbkkPr3vPkSEzHCWeAw1eA3pvTyO_UWwTAug_LQF2RBrih4Qpgd-kxZ5rt7zw3uS8WOaxCQaxaAxv0lVeNdiHxVrjObDaC7u4ZbngKwIJYn75BO1KaLxOmK8WeNTvy9Zc9Hkjm2vI4L4LiRwAd_AwtfTn9k3-CuCj1riMCFA2elGDXu_IZlLjYScaKocck7hNrmt-Igr1x5lJCi1qnjcNJpIcUXhGxY6sVouPvk8v6mJ' },
  { id: 3, brand: 'Starbucks', title: 'Free Drink Reward', pts: 1200, cat: 'Dining',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlPWrd1G0npg71wkuQ1K0qKVlDxlAjyKAW9LkapTKotSZDaVs-Tim4Mdp1yXsZGKxvBAmIekDAqTG5ybRoRbk3iurkrht57SV8_TsjK57_p9MZxbG8nTDqagP4mMWn3p0DXT5FllTR5tIyPsACj7wQ7qYUvKYRoEOIe1Z2iLlWvPcjTPccgY7p_oZ8LaNoiuopXAkb5NP8AfFUal2Do9xqWrfKyIAPJ-ZNgAXKjb0HUrYuKKe1p5JltKnjSlnx08Zofp7tTDbRRqNw',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNBBOAgvmskc870s7b-lfvLlv_6N07Tz09sNG5NwoLwKxk-30N9d589Vf_MSYCqWkov-IWUnfFkpegELqNwCKAMSrIqM6tnNDilVYBR2UCqrZsXFqd7LeroTQhJ5QNTgcdkE0Hp0spt0ooBt2NUvlPTRILmGH8ELJbxoE9pZclVsviNe6WMMwWyDxATb3I1ikt4rXeMS-x51_XcJH99qsc8j5sFhrTu9NzypxEr9ABgfNWdml5U_aJZOT0nML36rmDFwuuH1fL94W8' },
];

export default function VouchersPage() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState({});
  const [cat, setCat] = useState('All Rewards');
  const toggle = (id) => setRevealed(p => ({ ...p, [id]: !p[id] }));
  const filteredRewards = cat === 'All Rewards' ? REWARDS : REWARDS.filter(r => r.cat === cat);

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
              <span className="vr-balance-num">2450</span>
              <span className="vr-balance-unit">Points</span>
            </div>
            <div className="vr-balance-badge">
              <span className="material-symbols-outlined vr-trend-icon" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              +150 this week
            </div>
          </div>
        </section>

        {/* My Vouchers */}
        <section className="vr-section">
          <div className="vr-section-header">
            <h2 className="vr-section-title">My Vouchers</h2>
            <button className="vr-view-all">View All</button>
          </div>
          <div className="vr-vouchers-list">
            {VOUCHERS.map(v => (
              <div className="vr-voucher-card" key={v.id}>
                <div className="vr-voucher-left">
                  <div className="vr-voucher-logo-wrap"><img src={v.logo} alt={v.brand} className="vr-voucher-logo" /></div>
                  <span className="vr-voucher-brand">{v.brand}</span>
                </div>
                <div className="vr-voucher-dash" />
                <div className="vr-voucher-right">
                  <div>
                    <h3 className="vr-voucher-discount">{v.discount}</h3>
                    <p className="vr-voucher-valid">{v.valid}</p>
                  </div>
                  <div className="vr-voucher-code-row">
                    <code className="vr-voucher-code" onClick={() => toggle(v.id)}>{revealed[v.id] ? v.code : 'ECO••••29'}</code>
                    <button className="vr-copy-btn" onClick={() => toggle(v.id)}><span className="material-symbols-outlined">content_copy</span></button>
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
                    <div className="vr-reward-brand-logo-wrap"><img src={r.brandLogo} alt={r.brand} className="vr-reward-brand-logo" /></div>
                    <span className="vr-reward-brand-name">{r.title}</span>
                  </div>
                </div>
                <div className="vr-reward-footer">
                  <div>
                    <p className="vr-reward-redeem-label">Redeem for</p>
                    <p className="vr-reward-pts">{r.pts} pts</p>
                  </div>
                  <button className="vr-unlock-btn">Unlock</button>
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

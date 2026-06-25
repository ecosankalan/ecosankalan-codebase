import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/shop.css';

const USER_POINTS = 2450;

const VOUCHERS = [
  { id: 1, brand: 'IKEA',      discount: '500 OFF',  valid: 'Valid until 24 Oct', code: 'ECOSANK29',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNBBOAgvmskc870s7b-lfvLlv_6N07Tz09sNG5NwoLwKxk-30N9d589Vf_MSYCqWkov-IWUnfFkpegELqNwCKAMSrIqM6tnNDilVYBR2UCqrZsXFqd7LeroTQhJ5QNTgcdkE0Hp0spt0ooBt2NUvlPTRILmGH8ELJbxoE9pZclVsviNe6WMMwWyDxATb3I1ikt4rXeMS-x51_XcJH99qsc8j5sFhrTu9NzypxEr9ABgfNWdml5U_aJZOT0nML36rmDFwuuH1fL94W8' },
  { id: 2, brand: 'Decathlon', discount: '15% OFF', valid: 'Valid until 12 Nov', code: 'ECOSANK29',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlM6mJNealfUT2z-rLv-XC9DpKoU40lAcglquS0c8NPMrt3U3R_g33OvijaSGYm0hlDFEsOXh6ctt_N5U64QxcSHcR6SCQceLxUYfLUCMU-Cy21R9p8z_jljET0hd95qDHG52v_ulhgV6hadS-EWbat9RXdgTd_XmJnEzrF3VDfZiJKfbsXrOMyfzRuCL1cT_4I0c6JMXxilKNmrqnKNHKshdfo-3RW0MxAk4fjrxGfF-2S92TZicTvBUfFmQ9uuCZtvpcuHPWQTvR' },
];

const PARTNERS = [
  { name: 'IKEA',      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcojhNb1tYMY1-v6eRbvJILqIwb2Cn-CP3YvtquBvkdKMYgMZJxLMbhX7lbVXLTAdvXYEwulNdmlXohGbWRhKqLHIADNw1hYAHDeAajQV3G_N14RdEzCz-WootC7J1nj6Qn_r19ySTzcaT0zoL5R2vxZKOGqV7N8yiBKorfb29FzygeKCgg8k4jl6JevgXNgnIYlpLOCk9yOl_TNsMKvTOUJojbqRc6g3W__ROI8vZ3K7o3Ui1HtSYwVQ43QZiaVjMW9DUNuMsrbnY' },
  { name: 'Amazon',    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuNwp13D2GVapRliA0KsLo4B-Os1eyfKpeWvvHYzVH557YZ-v2TjydkdfZ2JjBatHbXU_KZChdz3E4eeW9AMey4ctP0MkWZkIyjol8SKKJVTqO0FvbL75qP5UeTBDvE0SnPdLjPEV710IlanlS1f2E5m2V6xThYaSXdpyZQ9HjFMVYWtzPMnmwxkZ_M0IaOSx7VX5UCF7sxSrAyqOEiu5ZRaEAvff5ukn8rnX1pD4eLyOZCuovbDBFy9IS8Ulyrjmd-GDkbJniRuA5' },
  { name: 'Decathlon', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHlbudSqV7DRX5ag4LK5dxcG3oNWtDupwbLbkkPr3vPkSEzHCWeAw1eA3pvTyO_UWwTAug_LQF2RBrih4Qpgd-kxZ5rt7zw3uS8WOaxCQaxaAxv0lVeNdiHxVrjObDaC7u4ZbngKwIJYn75BO1KaLxOmK8WeNTvy9Zc9Hkjm2vI4L4LiRwAd_AwtfTn9k3-CuCj1riMCFA2elGDXu_IZlLjYScaKocck7hNrmt-Igr1x5lJCi1qnjcNJpIcUXhGxY6sVouPvk8v6mJ' },
];

const PRODUCTS = [
  { id: 1, name: 'Bamboo Travel Set',       partner: 'IKEA',      points: 450,  category: 'Home',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfiSL1MuBMWm7RNu9yqMvHLSUrHOT66R0_SSVlnkLLLd2JSKF8UW1otoFZc25BjVmQCL-_J9O76BBsDxWb4Uvd3DlmuOvtQCgHewaqEkVDIUsygPNr5ECXRLlKaimaP_thAlLBMx16kVc8Fu7nLEdH7kGKiek8yjirR05KpOEyDqMcxxkNwb9Po0UCUDfIrVyL564RZzABv3KLG8ABmDKNl1tysyrsRgtG8et97Cb2uyv47Pj67IVykleoAjdLFy4pUYJjTG5ef8mo' },
  { id: 2, name: 'Stainless Steel Bottle',  partner: 'Amazon',    points: 850,  category: 'Reusable',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCWfvdvXmQaNQISlOp_Ir-U1vz_esYatMo7Az1oaXv1bDO1CCxeDyQVsS_EPP_EjOEF66mit_Jqb9J4BD-kdTkcGtPXHE2m_tPqcnqCRZr46lg-4lYJRteNM5WPa0nJi9oOr7NplC_iOvUAdR0YG4YJ-vkkMiEBTOItbHVXNNcnNohODBjFhWs1LC5dGib-6ZWuqHt-6aT8kbCgsdi13razrBy6io8o0gDOq5A91wEqPPYJJ8MaI2J38N8WwpHiDism6hsZzggyOM0' },
  { id: 3, name: 'Cork Yoga Mat',           partner: 'Decathlon', points: 1200, category: 'Zero Waste',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYq_ChRfJ4BcXv-CO0xQaYMolp_gjwK9sO19FXVxW4YAii6t-7ibylveUc6lXgsP9ghtMID_dWkQP2P6gYs4RjERwPqscel7UGYxHKFLKTOj8VI4Ob0G_FxNbcdSo6POaEq65I4qniwsqCpPzpdbts53UeYk74mLIS-FrnBJOjOfN1LEe-tuNlK9Nv7jU1FDvKoAk6sz2SZDEf6Osys0ZyKVX-01DCbqy7XT247AC0TE710dSGMplPkspJ3zdUfLLDouNuT3OSNRRQ' },
  { id: 4, name: 'Cotton Mesh Bags',        partner: 'IKEA',      points: 300,  category: 'Kitchen',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcgpONdiUxAfpwVewwyps-I3xtcTtFKc0ZNTZHkHoJfxoHs1AX1NWB9tEgXG6qMETHWFlA4S9tuZenjTsWMZ4whGT9CYoWfTZ0gByuSdm_4CYIHy01vrbY3imEuVlCKEpcaeYD3onAvIQgL3M7OlQDTdwn9yC7N6CgPrVmbn-pFgUHDCD33ednNReSvcNsM0CPMNr6EQvi26KpbRBD--RBNo7EROUZArKE2EOQAmjnes6_FYXDhlbn-uQQ9bLDsyI9uCKsmyi6vuCt' },
];

const FILTER_CHIPS = ['All', 'Home', 'Kitchen', 'Reusable', 'Zero Waste'];

export default function ShopPage() {
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState('All');
  const [revealedCodes, setRevealedCodes] = useState({});
  const toggleCode = (id) => setRevealedCodes(p => ({ ...p, [id]: !p[id] }));
  const filtered = activeChip === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeChip);

  return (
    <div className="shop-root">
      <Navbar />
      <main className="shop-main">

        {/* Search */}
        <div className="shop-search-wrap">
          <span className="material-symbols-outlined shop-search-icon">shopping_bag</span>
          <input className="shop-search-input" placeholder="Search eco products..." type="text" />
        </div>

        {/* Hero */}
        <section className="shop-hero">
          <div className="shop-hero-left">
            <h1 className="shop-hero-title">Curated for the <span className="shop-hero-accent">Conscious</span></h1>
            <p className="shop-hero-desc">Redeem your hard-earned eco-points for premium sustainable essentials. High impact, zero waste, delivered to your doorstep.</p>
          </div>
          <div className="shop-balance-card">
            <div className="shop-balance-icon-wrap">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <span className="shop-balance-label">Your Balance</span>
              <span className="shop-balance-amount">{USER_POINTS.toLocaleString()} EP</span>
            </div>
          </div>
        </section>

        {/* My Vouchers */}
        <section className="shop-section">
          <div className="shop-section-header">
            <h2 className="shop-section-title">My Vouchers</h2>
            <button className="shop-view-all" onClick={() => navigate('/vouchers')}>View All</button>
          </div>
          <div className="shop-vouchers-list">
            {VOUCHERS.map(v => (
              <div className="shop-voucher-card" key={v.id}>
                <div className="shop-voucher-left">
                  <div className="shop-voucher-logo-wrap"><img src={v.logo} alt={v.brand} className="shop-voucher-logo" /></div>
                  <span className="shop-voucher-brand">{v.brand}</span>
                </div>
                <div className="shop-voucher-dash" />
                <div className="shop-voucher-right">
                  <div>
                    <h3 className="shop-voucher-discount">{v.discount}</h3>
                    <p className="shop-voucher-valid">{v.valid}</p>
                  </div>
                  <div className="shop-voucher-code-row">
                    <code className="shop-voucher-code" onClick={() => toggleCode(v.id)}>
                      {revealedCodes[v.id] ? v.code : 'ECO••••29'}
                    </code>
                    <button className="shop-copy-btn" onClick={() => toggleCode(v.id)}>
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filter Chips */}
        <div className="shop-chips-wrap">
          <div className="shop-chips-scroll">
            {FILTER_CHIPS.map(chip => (
              <button key={chip} className={`shop-chip${activeChip === chip ? ' active' : ''}`} onClick={() => setActiveChip(chip)}>{chip}</button>
            ))}
          </div>
        </div>

        {/* Featured Partners */}
        <section className="shop-section">
          <h3 className="shop-section-title" style={{ marginBottom: '1rem' }}>Featured Partners</h3>
          <div className="shop-partners-scroll">
            {PARTNERS.map(p => (
              <div className="shop-partner-tile" key={p.name}>
                <img src={p.logo} alt={p.name} className="shop-partner-logo" />
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="shop-section">
          <div className="shop-section-header">
            <h3 className="shop-section-title">Sustainable Picks</h3>
            <span className="shop-view-all-plain">See All</span>
          </div>
          <div className="shop-grid">
            {filtered.map(product => (
              <div className="shop-card" key={product.id} onClick={() => navigate('/product-detail', { state: { product } })}>
                <div className="shop-card-img-wrap">
                  <img className="shop-card-img" src={product.img} alt={product.name} />
                  <div className="shop-card-partner-badge">
                    <span className="material-symbols-outlined shop-verified-icon">verified</span>
                    <span className="shop-partner-name">{product.partner}</span>
                  </div>
                </div>
                <div className="shop-card-body">
                  <h4 className="shop-card-name">{product.name}</h4>
                  <div className="shop-card-pts-row">
                    <span className="material-symbols-outlined shop-star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    <span className="shop-card-pts">{product.points} pts</span>
                  </div>
                  <button className="shop-buy-btn" onClick={e => { e.stopPropagation(); navigate('/product-detail', { state: { product } }); }}>
                    Buy on Partner
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

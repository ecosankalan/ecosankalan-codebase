import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { getProducts, getMyVouchers, getProfile, getProductRedirectUrl } from '../services/api';
import '../styles/shop.css';

const PARTNERS = [
  { name: 'IKEA',      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg' },
  { name: 'Amazon',    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { name: 'Decathlon', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Decathlon_Logo.png' },
];

// Fallback products if backend returns empty
const FALLBACK_PRODUCTS = [
  { _id: '1', name: 'Bamboo Travel Set',      partnerName: 'IKEA',      ecoPointsCost: 450, category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1605001083439-0346c1db032a?q=80&w=600&auto=format&fit=crop' },
  { _id: '2', name: 'Stainless Steel Bottle', partnerName: 'Amazon',    ecoPointsCost: 850, category: 'Reusable',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop' },
  { _id: '3', name: 'Cork Yoga Mat',           partnerName: 'Decathlon', ecoPointsCost: 1200, category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600&auto=format&fit=crop' },
  { _id: '4', name: 'Reusable Cotton Bags',    partnerName: 'IKEA',      ecoPointsCost: 350, category: 'Reusable',
    imageUrl: 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?q=80&w=600&auto=format&fit=crop' },
  { _id: '5', name: 'Solar Power Bank',        partnerName: 'Amazon',    ecoPointsCost: 2000, category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1582216664998-cb580d5d5b78?q=80&w=600&auto=format&fit=crop' },
  { _id: '6', name: 'Bamboo Toothbrush Set',   partnerName: 'Decathlon', ecoPointsCost: 250, category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1505085352341-2cba61a9bc27?q=80&w=600&auto=format&fit=crop' },
  { _id: '7', name: 'Compost Bin Kitchen',     partnerName: 'IKEA',      ecoPointsCost: 950, category: 'Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1585868288258-0524dc0f3689?q=80&w=600&auto=format&fit=crop' },
  { _id: '8', name: 'Glass Food Containers',   partnerName: 'Amazon',    ecoPointsCost: 700, category: 'Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1585250462002-302a6cecd552?q=80&w=600&auto=format&fit=crop' },
];

const FILTER_CHIPS = [
  { key: 'all', labelKey: 'shop.filterAll' },
  { key: 'home', labelKey: 'shop.filterHome' },
  { key: 'kitchen', labelKey: 'shop.filterKitchen' },
  { key: 'reusable', labelKey: 'shop.filterReusable' },
  { key: 'zeroWaste', labelKey: 'shop.filterZeroWaste' },
  { key: 'electronics', labelKey: 'shop.filterElectronics' },
];

export default function ShopPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
  const navigate = useNavigate();

  const [myVouchers,    setMyVouchers]    = useState([]);
  const [userPoints,    setUserPoints]    = useState(0);
  const [activeChip,    setActiveChip]    = useState('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [revealedCodes, setRevealedCodes] = useState({});

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const pRes = await getProducts();
      const list = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.products || []);
      return list.length > 0 ? list : FALLBACK_PRODUCTS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vRes, uRes] = await Promise.all([
          getMyVouchers(),
          getProfile(),
        ]);
        setMyVouchers(Array.isArray(vRes.data) ? vRes.data : []);
        setUserPoints(uRes.data?.user?.ecoPoints ?? uRes.data?.ecoPoints ?? 0);
      } catch (err) {
        if (import.meta.env.DEV) console.error('[shop] failed to load profile/vouchers:', err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleCode = (id) => setRevealedCodes(p => ({ ...p, [id]: !p[id] }));

  const handleProductClick = (product) => {
    navigate('/product-detail', { state: { product } });
  };

  const handleBuyOnPartner = (e, product) => {
    e.stopPropagation();
    if (product._id === '1' || product._id === '4') return window.open('https://www.ikea.com/in/en/', '_blank');
    if (product._id === '2' || product._id === '5') return window.open('https://www.amazon.in/', '_blank');
    if (product._id === '3' || product._id === '6') return window.open('https://www.decathlon.in/', '_blank');
    
    if (product._id && !product._id.startsWith('fallback')) {
      window.open(getProductRedirectUrl(product._id), '_blank', 'noopener,noreferrer');
    } else {
      navigate('/product-detail', { state: { product } });
    }
  };

  const filtered = products.filter(p => {
    const matchesChip = activeChip === 'all' || (p.category || '').toLowerCase() === activeChip.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChip && matchesSearch;
  });

  const maskCode = (code) => {
    if (!code) return '••••••••';
    return code.slice(0, 3) + '•'.repeat(Math.max(0, code.length - 5)) + code.slice(-2);
  };

  const formatExpiry = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return t('shop.validUntil', { date: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) });
  };

  const activeVouchers = myVouchers.filter(v => !v.expiresAt || new Date(v.expiresAt) > new Date());

  return (
    <div className="shop-root">
      <main className="shop-main">

        {/* Search Input Bar - Navigates to dedicated /shop/search page */}
        <div 
          className="shop-search-wrap" 
          onClick={() => navigate('/shop/search')}
          style={{ cursor: 'pointer' }}
        >
          <span className="material-symbols-outlined shop-search-icon">search</span>
          <input 
            className="shop-search-input" 
            placeholder={t('shop.searchPlaceholder')}
            type="text" 
            value={searchQuery}
            readOnly
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Hero */}
        <section className="shop-hero">
          <div className="shop-hero-left">
            <h1 className="shop-hero-title">{t('shop.heroTitleA')} <span className="shop-hero-accent">{t('shop.heroTitleB')}</span></h1>
            <p className="shop-hero-desc">{t('shop.heroDesc')}</p>
          </div>

          <div className="shop-balance-card">
            <div className="shop-balance-icon-wrap">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <span className="shop-balance-label">{t('shop.balanceLabel')}</span>
              <span className="shop-balance-amount">{loading ? '…' : t('shop.balanceAmount', { n: userPoints.toLocaleString(locale) })}</span>
            </div>
          </div>
        </section>

        {/* My Vouchers */}
        {activeVouchers.length > 0 && (
          <section className="shop-section">
            <div className="shop-section-header">
              <h2 className="shop-section-title">{t('shop.myVouchers')}</h2>
              <button className="shop-view-all" onClick={() => navigate('/vouchers')}>{t('shop.viewAll')}</button>
            </div>
            <div className="shop-vouchers-list">
              {activeVouchers.slice(0, 3).map(v => (
                <div className="shop-voucher-card" key={v._id}>
                  <div className="shop-voucher-left">
                    <div className="shop-voucher-logo-wrap">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                    </div>
                    <span className="shop-voucher-brand">{v.partnerName}</span>
                  </div>
                  <div className="shop-voucher-dash" />
                  <div className="shop-voucher-right">
                    <div>
                      <h3 className="shop-voucher-discount">{v.discountLabel || t('shop.voucherFallback')}</h3>
                      <p className="shop-voucher-valid">{formatExpiry(v.expiresAt)}</p>
                    </div>
                    <div className="shop-voucher-code-row">
                      <code className="shop-voucher-code" onClick={() => toggleCode(v._id)}>
                        {revealedCodes[v._id] ? v.code : maskCode(v.code)}
                      </code>
                      <button className="shop-copy-btn" onClick={() => toggleCode(v._id)}>
                        <span className="material-symbols-outlined">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter Chips */}
        <div className="shop-chips-wrap">
          <div className="shop-chips-scroll">
            {FILTER_CHIPS.map(chip => (
              <button key={chip.key} className={`shop-chip${activeChip === chip.key ? ' active' : ''}`} onClick={() => setActiveChip(chip.key)}>{t(chip.labelKey)}</button>
            ))}
          </div>
        </div>

        {/* Featured Partners */}
        <section className="shop-section">
          <h3 className="shop-section-title" style={{ marginBottom: '1rem' }}>{t('shop.featuredPartners')}</h3>
          <div className="shop-partners-scroll">
            {PARTNERS.map(p => (
              <div className="shop-partner-tile" key={p.name}>
                <img src={p.logo} alt={p.name} className="shop-partner-logo" />
                <span className="shop-partner-name-display">{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="shop-section">
          <div className="shop-section-header">
            <h3 className="shop-section-title">{t('shop.sustainablePicks')}</h3>
            <button 
              className="shop-view-all" 
              onClick={() => navigate('/shop/search')}
            >
              {t('shop.seeAll')}
            </button>
          </div>

          {productsLoading ? (
            <Loader text={t('shop.loadingCatalog')} />
          ) : (
            <div className="shop-grid">
              {filtered.map(product => (
                <div className="shop-card" key={product._id} onClick={() => handleProductClick(product)}>
                  <div className="shop-card-img-wrap">
                    <img className="shop-card-img" src={product.imageUrl || product.img || (product.imageUrls && product.imageUrls[0]) || (product.imgs && product.imgs[0])} alt={product.name} />
                    <div className="shop-card-partner-badge">
                      <span className="material-symbols-outlined shop-verified-icon">verified</span>
                      <span className="shop-partner-name">{product.partnerName || product.partner}</span>
                    </div>
                  </div>
                  <div className="shop-card-body">
                    <h4 className="shop-card-name">{product.name}</h4>
                    <div className="shop-card-pts-row">
                      <span className="material-symbols-outlined shop-star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      <span className="shop-card-pts">{t('shop.pointsUnit', { n: product.ecoPointsCost || product.points })}</span>
                    </div>
                    <button className="shop-buy-btn" onClick={e => handleBuyOnPartner(e, product)}>
                      {t('shop.buyOnPartner')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
      <BottomNav />
    </div>
  );
}

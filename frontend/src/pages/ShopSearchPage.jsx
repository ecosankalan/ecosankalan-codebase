import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { getProducts } from '../services/api';
import '../styles/shop.css';

const FALLBACK_PRODUCTS = [
  { _id: '1', name: 'Bamboo Travel Set', partnerName: 'IKEA', ecoPointsCost: 450, category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1605001083439-0346c1db032a?q=80&w=600&auto=format&fit=crop' },
  { _id: '2', name: 'Stainless Steel Bottle', partnerName: 'Amazon', ecoPointsCost: 850, category: 'Reusable',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop' },
  { _id: '3', name: 'Cork Yoga Mat', partnerName: 'Decathlon', ecoPointsCost: 1200, category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600&auto=format&fit=crop' },
  { _id: '4', name: 'Reusable Cotton Bags', partnerName: 'IKEA', ecoPointsCost: 350, category: 'Reusable',
    imageUrl: 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?q=80&w=600&auto=format&fit=crop' },
  { _id: '5', name: 'Solar Power Bank', partnerName: 'Amazon', ecoPointsCost: 2000, category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1582216664998-cb580d5d5b78?q=80&w=600&auto=format&fit=crop' },
  { _id: '6', name: 'Bamboo Toothbrush Set', partnerName: 'Decathlon', ecoPointsCost: 250, category: 'Zero Waste',
    imageUrl: 'https://images.unsplash.com/photo-1505085352341-2cba61a9bc27?q=80&w=600&auto=format&fit=crop' },
  { _id: '7', name: 'Compost Bin Kitchen', partnerName: 'IKEA', ecoPointsCost: 950, category: 'Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1585868288258-0524dc0f3689?q=80&w=600&auto=format&fit=crop' },
  { _id: '8', name: 'Glass Food Containers', partnerName: 'Amazon', ecoPointsCost: 700, category: 'Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1585250462002-302a6cecd552?q=80&w=600&auto=format&fit=crop' },
];

const POPULAR_SEARCHES = ['Bamboo', 'Reusable', 'Bottle', 'Compost', 'Zero Waste', 'Kitchen'];

export default function ShopSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const pRes = await getProducts();
      const list = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.products || []);
      return list.length > 0 ? list : FALLBACK_PRODUCTS;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleProductClick = (product) => {
    navigate('/product-detail', { state: { product } });
  };

  const filteredProducts = query.trim() === ''
    ? products
    : products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.partnerName || p.partner || '').toLowerCase().includes(query.toLowerCase())
      );

  const suggestions = query.trim() !== ''
    ? Array.from(new Set(
        products
          .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
          .map(p => p.name)
      )).slice(0, 5)
    : [];

  return (
    <div className="shop-root">
      <Navbar />

      <main className="shop-main">
        {/* Dedicated Mobile-First Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              color: 'var(--on-surface)',
              borderRadius: '50%',
            }}
            aria-label={t('shop.backToShop')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div className="shop-search-wrap" style={{ flex: 1, position: 'relative' }}>
            <span className="material-symbols-outlined shop-search-icon">search</span>
            <input
              ref={inputRef}
              className="shop-search-input"
              placeholder={t('shop.searchPagePlaceholder')}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={t('shop.clearSearch')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
              </button>
            )}
          </div>
        </div>

        {/* Popular Tags */}
        {query.trim() === '' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
              {t('shop.popularSearches')}
            </span>            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {POPULAR_SEARCHES.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--outline-variant)',
                    background: 'var(--surface-container-low)',
                    color: 'var(--on-surface)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Suggestions list when typing */}
        {query.trim() !== '' && suggestions.length > 0 && (
          <div style={{ background: 'var(--surface-container-low)', borderRadius: '12px', padding: '0.5rem' }}>
            {suggestions.map((sug, i) => (
              <div
                key={i}
                onClick={() => setQuery(sug)}
                style={{
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--on-surface)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>search</span>
                {sug}
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        <section className="shop-section">
          <div className="shop-section-header">
            <h3 className="shop-section-title">
              {query.trim() ? t('shop.searchResults', { n: filteredProducts.length }) : t('shop.allProducts')}
            </h3>
          </div>

          {loading ? (
            <Loader text={t('shop.searchingCatalog')} />
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--outline)', marginBottom: '0.5rem' }}>search_off</span>
              <p style={{ fontSize: '0.9rem' }}>{t('shop.noResults', { q: query })}</p>
            </div>
          ) : (
            <div className="shop-grid">
              {filteredProducts.map(product => (
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

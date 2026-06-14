import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/shop.css';

const PRODUCTS = [
  {
    id: 1,
    name: 'Bamboo Toothbrush Set',
    desc: 'Pack of 4 biodegradable charcoal-infused brushes.',
    price: '$12.00',
    points: 450,
    rating: 4.9,
    tag: 'Top Seller',
    category: 'Personal Care',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgi_O_uax92ZJBMiINdViTkmapc8Db4B_EAM7KQ5kmBxKTdQAkBcX8HcEVbagzSpaI-ONorX7LoP0bshMGpgWtH8Zv_iqgLvjJ_mVwy49gQud-iPi81zCu3vir5gP7pAiiIIVik0YMljVBE66DB_2x4WBczM1ETDzDWfEOGXnS7ama85pp1C59Xw6pEqJLHnOdVsWpicW4ypUGjAorqPFn8fWFsNmhobGJh4rnU_ueii9hbDJWmOCTLaTJYOo-LG56XIV63faSlYEs',
  },
  {
    id: 2,
    name: 'Insulated Steel Bottle',
    desc: 'Keep drinks cold for 24h. Grade 304 steel.',
    price: '$28.00',
    points: 950,
    rating: 4.8,
    tag: null,
    category: 'Reusables',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqARTqSk3bRPPvsFANeYOqqg5AxfhDi_FAK3eeVlMhrn_Vlv8X6vVq_jq9X3CjDm7TJItw3rAZzJSXtphX201o-WcZXBsJX1-NJjcGsIELVWxLReOhHVIBQMfKOaHp2Ww7HtkJwbohtbIMRmiU1bgkqrTD4tlz5pXjJUFy1HTI1z6ud6naDMz-Ry_2idvQ0ZJAkZ1I9BtcXoJQpOqq5blTTkEY9PxplPnXIE3WjfY3S_P_83geB9UZ2pu6UcSuIDabnwE8VhQcYXai',
  },
  {
    id: 3,
    name: 'Organic Mesh Tote',
    desc: 'Expandable GOTS certified organic cotton.',
    price: '$15.00',
    points: 300,
    rating: 5.0,
    tag: null,
    category: 'Reusables',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFIffwc6xlGfq9HkdRrWkZUiTc5RYlqL1Kuph5nX2P9PQHe7339-aXo-nrIY0OnQwyFGVy9xVVgtpNgJmgwFgL2QaX9FJwpTn6AvU_-njPPOjaL_GgmQfJbYVKgKQVjZOcWaVWYZRj0hf_LhPZYAZKlXh00kxXqfiV6Eb_uwPN6Zg4dWKjhU6kk4EUU4JeCcw0PKdSXIQOz2R0ookppKq0wLaWJkYkowz4LcPSvJN2_gyRQqR763CV1GE_JyZ-khUeiJoGmA5cRSm5',
  },
  {
    id: 4,
    name: 'Artisan Hemp Soap',
    desc: 'Handmade, palm oil free, plastic-free wrap.',
    price: '$8.50',
    points: 250,
    rating: 4.7,
    tag: null,
    category: 'Personal Care',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQd91On3sAYR04l6w69Fcehv8ec_SeojY4nCb2avz3hp21-e0jikudNP6pygHwfPAwulHxwqjdo7i_hFqM2-PHW4Od0QSHeLxuCp0-eBSkBebQquUDp1afYBT6KQqAH4QieasS-9rZbJOetyaB6R7_4V_sEGSUKySZXkKwJSPokHu140aS5yVyQF94GPoTFcb__Ze328huGaHsKLkSeZqcT1ynfUC84xDnpDuzP0ZzHTQwGqzP2YiPaGGVkaQ4xF_Dt8N5ItzLqaFA',
  },
  {
    id: 5,
    name: 'Natural Cork Mat',
    desc: 'Sustainably harvested cork. Non-slip grip.',
    price: '$65.00',
    points: 2100,
    rating: 4.9,
    tag: null,
    category: 'Household',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz6seDs10PgQacKroz6RXCFxVo6k7S4kc9DCTNizRj3UDxg9yo7sOrVeKeQX5E52CXQ-EZljEtYayJ3YnXwKCX0D0O91vCFTGSlQyWndJJyoiN29H-tkxMsXqk3nOWHXxaO5u0-aLHA5RKJ0O_DGNHUWWDz5HfuQr51bSDlE62rtif5eizEBRt4473qJPGOD9MPM_xtKE-m4hJrwAvwe7SCVZhjZoQWggHzg5pzAMIPTAcGflONgIKKMJgWGrrP18jAdAbUFgUzH9e',
  },
  {
    id: 6,
    name: 'Bamboo Fiber Plates',
    desc: 'Compostable alternative to plastic dinnerware.',
    price: '$22.00',
    points: 750,
    rating: 4.6,
    tag: null,
    category: 'Household',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWphPGLNsK8pZazKkyRcgkljTAStge96ndwC4kn-ECXj7vMzNHSAoJ1kgaMEgUpmuSQoO54ZUA0QFBv3krNA-vZjL2Tp7ukEBSN--VFXULN-fGj9U97TIGGDupjTIUdtAhHlgwZuTnnTf7N4-gEvjHowdIUHMzUmxqEFIV8GG9zB-Kdn0jrPMp6WCHFWa78uTsUK0JLKKirOv9eOo3YStNmpcHwWdn8tErnCdWkdZt58f1Bjj2h0VLPyvp0NPZ2QmkhwykKLXQAibV',
  },
];

const CATEGORIES = ['All Products', 'Household', 'Personal Care', 'Reusables'];
const USER_POINTS = 2450;

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [sortBy, setSortBy]                 = useState('Newest');
  const [cart, setCart]                     = useState([]);
  const [toast, setToast]                   = useState('');

  const filtered = activeCategory === 'All Products'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    if (cart.includes(product.id)) return;
    setCart(c => [...c, product.id]);
    setToast(`${product.name} added to cart!`);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="shop-root">
      <Navbar />

      <main className="shop-main">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="shop-hero">
          <div className="shop-hero-left">
            <h1 className="shop-hero-title">
              Curated for the{' '}
              <span className="shop-hero-accent">Conscious</span>
            </h1>
            <p className="shop-hero-desc">
              Redeem your hard-earned eco-points for premium sustainable
              essentials. High impact, zero waste, delivered to your doorstep.
            </p>
          </div>
          <div className="shop-hero-right">
            <div className="shop-balance-card">
              <div className="shop-balance-icon-wrap">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
              </div>
              <div>
                <span className="shop-balance-label">Your Balance</span>
                <span className="shop-balance-amount">
                  {USER_POINTS.toLocaleString()} EP
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Filters + Sort ────────────────────────────────────── */}
        <section className="shop-filters">
          <div className="shop-pills-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`shop-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="shop-sort-wrap">
            <select
              className="shop-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Eco-Points: Low to High</option>
              <option>Highest Rating</option>
            </select>
            <span className="material-symbols-outlined shop-sort-chevron">
              expand_more
            </span>
          </div>
        </section>

        {/* ── Toast notification ────────────────────────────────── */}
        {toast && (
          <div className="shop-toast">
            <span className="material-symbols-outlined">check_circle</span>
            {toast}
          </div>
        )}

        {/* ── Product Grid ──────────────────────────────────────── */}
        <div className="shop-grid">
          {filtered.map(product => {
            const inCart = cart.includes(product.id);
            return (
              <div className="shop-card" key={product.id}>
                {/* Product image */}
                <div className="shop-card-img-wrap">
                  <img
                    className="shop-card-img"
                    src={product.img}
                    alt={product.name}
                  />
                  {product.tag && (
                    <span className="shop-card-tag">{product.tag}</span>
                  )}
                </div>

                {/* Card body */}
                <div className="shop-card-body">
                  <div className="shop-card-header">
                    <h3 className="shop-card-name">{product.name}</h3>
                    <div className="shop-card-rating">
                      <span
                        className="material-symbols-outlined shop-star"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="shop-rating-val">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="shop-card-desc">{product.desc}</p>

                  <div className="shop-card-footer">
                    <div>
                      <span className="shop-card-price">{product.price}</span>
                      <span className="shop-card-pts">
                        {product.points.toLocaleString()} Eco-Points
                      </span>
                    </div>
                    <button
                      className={`shop-bag-btn ${inCart ? 'in-cart' : ''}`}
                      onClick={() => addToCart(product)}
                      disabled={inCart}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <span className="material-symbols-outlined">
                        {inCart ? 'check' : 'shopping_bag'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

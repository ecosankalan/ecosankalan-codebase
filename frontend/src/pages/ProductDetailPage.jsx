import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import { getProducts, getProductRedirectUrl } from '../services/api';
import '../styles/product-detail.css';

const DEFAULT = {
  name: 'Nordic Bamboo Desktop Organizer', partner: 'IKEA', price: '$34.99', points: 850, co2: '2.5kg CO2',
  about: 'Hand-crafted from 100% FSC-certified bamboo, this desktop organizer combines Scandinavian functionalism with sustainable materials. Designed for the modern professional, it features three tiered compartments for mail, notebooks, and digital accessories.',
  specs: ['Dimensions: 25cm x 15cm x 12cm', 'Water-resistant wax coating'],
  imgs: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD_ehHkEgonIDemsK8JToitfRydIHae_8U_LTLj2tDgZRsopFDir2HF9_oinA4f82mZeH3aAp6T4x_JPRv7opnKVBBGrXlxNLlroyls3M6I7HQKhhX6oV20MhwnzUpsbDyOc6G-PLUzewNHepNgUP4-6b3g3GnfR5hN4KPRsX-ItOaJPAO9k3c6DD_4FELKkdakXXHDD7yhcCu7K9gUUvHCNzJnjEsJxKDbclDMIVzp-_VtKvxzVU9RsMmfGer7CFxyCA8Q2tuhJUI6',
  ],
  related: [],
};

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const raw = location.state?.product ?? {};
  
  // Use actual db fields, mapped to display fields
  const product = {
    _id: raw._id,
    name: raw.name || DEFAULT.name,
    partner: raw.partnerName || DEFAULT.partner,
    price: raw.priceINR ? `₹${raw.priceINR}` : DEFAULT.price,
    points: raw.ecoPointsCost || DEFAULT.points,
    category: raw.category,
    co2: '1.2kg CO2 Saved',
    about: raw.description || DEFAULT.about,
    specs: DEFAULT.specs,
    imgs: (raw.imageUrls && raw.imageUrls.length > 0) ? [raw.imageUrls[0]] : (raw.img ? [raw.img] : DEFAULT.imgs),
  };

  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    // Fetch products from the same category for the "You Might Also Like" section
    const fetchRelated = async () => {
      try {
        const res = await getProducts(product.category);
        if (res.data && res.data.length > 0) {
          // Filter out the current product
          setRelated(res.data.filter(p => p._id !== product._id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load related products');
      }
    };
    if (product.category) fetchRelated();
  }, [product.category, product._id]);

  return (
    <div className="pd-root">
      <Navbar />
      <main className="pd-main">

        {/* Carousel / Image */}
        <section className="pd-carousel">
          <div className="pd-carousel-track" style={{ transform: `translateX(0%)` }}>
            <img src={product.imgs[0]} alt={`${product.name}`} className="pd-carousel-img" />
          </div>
          <button className="pd-fav-btn"><span className="material-symbols-outlined">favorite</span></button>
          <button className="pd-back-btn" onClick={() => navigate(-1)}><span className="material-symbols-outlined">arrow_back</span></button>
        </section>

        {/* Identity */}
        <section className="pd-identity">
          <h1 className="pd-name">{product.name}</h1>
          <span className="pd-partner-label">{product.partner} Partner</span>
          <div className="pd-price-row">
            <span className="pd-price">{product.price}</span>
            <span className="pd-or">or</span>
            <div className="pd-pts-badge">
              <span className="material-symbols-outlined pd-pts-icon" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              {product.points} Points
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="pd-metrics">
          <div className="pd-metric-wide">
            <div className="pd-metric-avatar"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_2</span></div>
            <div>
              <p className="pd-metric-label">Carbon Saving</p>
              <p className="pd-metric-val">{product.co2}</p>
            </div>
          </div>
          <div className="pd-metric-tile tertiary">
            <span className="material-symbols-outlined">potted_plant</span>
            <p>100% Sustainable Material</p>
          </div>
          <div className="pd-metric-tile primary">
            <span className="material-symbols-outlined">fan_indirect</span>
            <p>Zero Plastic Packaging</p>
          </div>
        </section>

        {/* About (expandable) */}
        <section className="pd-about-card">
          <button className="pd-about-toggle" onClick={() => setExpanded(e => !e)}>
            <span className="pd-about-toggle-title">About the Product</span>
            <span className="material-symbols-outlined pd-chevron" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>expand_more</span>
          </button>
          {expanded && (
            <div className="pd-about-content">
              <p className="pd-about-text">{product.about}</p>
              {product.specs?.map((s, i) => (
                <div className="pd-spec-item" key={i}>
                  <span className="material-symbols-outlined pd-spec-check">check_circle</span>
                  {s}
                </div>
              ))}
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="pd-related-section">
            <div className="pd-related-header">
              <h2 className="pd-related-title">You Might Also Like</h2>
              <button className="pd-view-all">View All</button>
            </div>
            <div className="pd-related-scroll">
              {related.map((r, i) => (
                <div className="pd-related-card" key={r._id} onClick={() => navigate('/product-detail', { state: { product: r }, replace: true })}>
                  <div className="pd-related-img-wrap"><img src={r.imageUrls?.[0]} alt={r.name} className="pd-related-img" /></div>
                  <p className="pd-related-name">{r.name}</p>
                  <p className="pd-related-price">₹{r.priceINR}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
      <footer className="pd-footer">
        <button className="pd-buy-btn" onClick={() => window.open(getProductRedirectUrl(product._id), '_blank', 'noopener,noreferrer')}>
          Buy on Partner <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>
      <BottomNav />
    </div>
  );
}

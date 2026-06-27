import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/product-detail.css';

const DEFAULT = {
  name: 'Nordic Bamboo Desktop Organizer', partner: 'IKEA', price: '$34.99', points: 850, co2: '2.5kg CO2',
  about: 'Hand-crafted from 100% FSC-certified bamboo, this desktop organizer combines Scandinavian functionalism with sustainable materials. Designed for the modern professional, it features three tiered compartments for mail, notebooks, and digital accessories.',
  specs: ['Dimensions: 25cm x 15cm x 12cm', 'Water-resistant wax coating'],
  imgs: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD_ehHkEgonIDemsK8JToitfRydIHae_8U_LTLj2tDgZRsopFDir2HF9_oinA4f82mZeH3aAp6T4x_JPRv7opnKVBBGrXlxNLlroyls3M6I7HQKhhX6oV20MhwnzUpsbDyOc6G-PLUzewNHepNgUP4-6b3g3GnfR5hN4KPRsX-ItOaJPAO9k3c6DD_4FELKkdakXXHDD7yhcCu7K9gUUvHCNzJnjEsJxKDbclDMIVzp-_VtKvxzVU9RsMmfGer7CFxyCA8Q2tuhJUI6',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDoO3GUU-XukQatPJe1r7Pab3EJM_Iv4-ph70wMFAsW99LoAdEeMD-9YrG3ykeI23G6e7FYwNTqu6UjppVOBFm3NTCgVhpMHtUQbtFtFiS1PMeBjHs78RPHb_HoWyRGeTd9AQF-6nM2gggaJM88YIwiKe-shcJKY1X_J-8YOL8GKQDDumP0esn3776LPEUooTu5qhZGjKcZ887ZZnXYPup4dXFFd5yPQrl_cVCkkA5le4BTPoaiMIXLNU-zJvat9osH0ZuDze1HtzRq',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlSOA0G-rIJCqdRL6CSxde6Xw9O9r9dthkkhsOBwsz3sqZHtNG_Vay7Wya-XVXptjcWd5yzvYSVHrCyaD5xelD3JDMXrvsD0JljWemC4CSKBJQkCDJ8rA87_3vagxo3GLOxOWZBV9pQxqZS9-4uJfO8UCKqk9r_1bYrchcNxhEsUZXMBDah8oKFzC11Rm58BvANzaWRYG1K5aw5PvC3_C4Nt7JJn6wsWxEXIixaNPlKRukcCRZIZ_Acem1LSUKfP_hWfe8Rb6qm0IP',
  ],
  related: [
    { name: 'Felt Laptop Sleeve', price: '$19.99', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyU4ndqS48u0hcvE5ybIT1qbF-eyzTNVpSQdXa_7Ij-xbDV_rEv4NPi0C1FHXcErTAphTiQoTVfHcLjuKfvUjd5dUQschyzX6sbj5SGwOs8z5ge78esEvWNZnRUbgJ1VJNJUPH32gwNhg9wTkgejZrrX4BIPjJltj0p-JSAEG7ib4wrSi0GoZOrYozQrmR9ZDCKTfjdjkNGX5JEwkF7q0yRkYqNXAPHvXCEo_uLAkfwdGQ6DFmOeSpteelM8eDHy3oua5IqeS_Cqqx' },
    { name: 'Solar Desk Lamp',    price: '$45.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3rS8Lyhw13FvuTViItniI7cS4geLa97fWcRoyk2fml32j3Ueud0Ht70YjDjXBEud87mSmwSz3WCTNrsT0LNISVEv728RVde9qevZZABHOz6CAUaPaOleCFAdZIQf3h9YRjLJFfdOTH25nH44Mys7o2coKK5iyIjj_tMx8MR4oQF84KQgvbROZKKUk9vzBYB-1MZTct2oMzXuDylFENrO2H2X_NA-BjwzfO_SoZxng3SoEEeQe0GUxxH9HK-hb6WPFDGx_EXPtxJMU' },
    { name: 'Natural Cork Set',   price: '$12.50', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfiSL1MuBMWm7RNu9yqMvHLSUrHOT66R0_SSVlnkLLLd2JSKF8UW1otoFZc25BjVmQCL-_J9O76BBsDxWb4Uvd3DlmuOvtQCgHewaqEkVDIUsygPNr5ECXRLlKaimaP_thAlLBMx16kVc8Fu7nLEdH7kGKiek8yjirR05KpOEyDqMcxxkNwb9Po0UCUDfIrVyL564RZzABv3KLG8ABmDKNl1tysyrsRgtG8et97Cb2uyv47Pj67IVykleoAjdLFy4pUYJjTG5ef8mo' },
  ],
};

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const raw = location.state?.product ?? {};
  const product = { ...DEFAULT, ...raw, imgs: raw.img ? [raw.img, ...DEFAULT.imgs.slice(1)] : DEFAULT.imgs };
  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pd-root">
      <Navbar />
      <main className="pd-main">

        {/* Carousel */}
        <section className="pd-carousel">
          <div className="pd-carousel-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {product.imgs.map((src, i) => <img key={i} src={src} alt={`${product.name} ${i+1}`} className="pd-carousel-img" />)}
          </div>
          <div className="pd-dots">
            {product.imgs.map((_, i) => <button key={i} className={`pd-dot${slide === i ? ' active' : ''}`} onClick={() => setSlide(i)} />)}
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

        {/* Related */}
        <section className="pd-related-section">
          <div className="pd-related-header">
            <h2 className="pd-related-title">You Might Also Like</h2>
            <button className="pd-view-all">View All</button>
          </div>
          <div className="pd-related-scroll">
            {product.related.map((r, i) => (
              <div className="pd-related-card" key={i}>
                <div className="pd-related-img-wrap"><img src={r.img} alt={r.name} className="pd-related-img" /></div>
                <p className="pd-related-name">{r.name}</p>
                <p className="pd-related-price">{r.price}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <footer className="pd-footer">
        <button className="pd-buy-btn">Buy on Partner <span className="material-symbols-outlined">arrow_forward</span></button>
      </footer>
      <BottomNav />
    </div>
  );
}

import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/event-detail.css';

const DEFAULT_EVENT = {
  title: 'Urban Composting Workshop',
  category: 'Sustainability',
  date: 'Sat, Oct 24',
  dateFull: 'Saturday, October 24',
  time: '10:00 AM – 12:00 PM',
  location: 'Green Park Hub',
  distance: '1.2km away',
  points: 50,
  attendees: 128,
  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlFAjqzzjPf8Laz0o9HntXHV2ygQelpR8-dqZ0QFuuWRLMEEFX1dnnww_AFuLoBHKeZ_j2tbDUxAWnqQ3OjdiZUrlFebZCeCDTylvbh_6ueH7SSxLl02eXtkNdcpQ7Zh3D4_qzLEVGN-GM94FdHIbp8_bQlrQZMAFc3x6MZCGCfNGt1G0BgcE7MIXIIVvgd_Vi7K43pXlPHgxHRvXtYZcZvWeCqu_VUhO8TPnUg4rJJQwwLdywhsOHjxEYDNzHjMKOBQI9p8EYWNmx',
  about: [
    "Join our hands-on workshop to learn the art of urban composting. Transform your kitchen scraps into nutrient-rich soil right in your apartment or small balcony. We'll cover everything from choosing the right bin to balancing your greens and browns.",
    "Perfect for beginners and eco-enthusiasts looking to reduce their carbon footprint while nurturing their indoor plants or small garden.",
  ],
  organizer: { name: 'EcoAction', type: 'Community NGO' },
  avatars: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCDGcOx40mvHF1d8UCTtMVAZ45fLEwgGyz-Q31TTNKcL0I0GX-e2x-MBaCdKpiWrKB0-D2RzjLLHzz-zaEpc2-xu_omoObKCLiMmY-cLoyc-J6dZA-qOa8VksvgeirZyyCGmH8oCP4XxBh_jtSV4ut0uCnK0Ts1lpU3bI7CoWMg5VVGSSAYI-Qq_IIGW8BeVIFpurvQG9ONKHfjtOOe08ROwTcCvkPooOU5kmwVWfC3b0b299bhPmY9J1tyf73WzA3mV1aqgug0jdNi',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDyU4ndqS48u0hcvE5ybIT1qbF-eyzTNVpSQdXa_7Ij-xbDV_rEv4NPi0C1FHXcErTAphTiQoTVfHcLjuKfvUjd5dUQschyzX6sbj5SGwOs8z5ge78esEvWNZnRUbgJ1VJNJUPH32gwNhg9wTkgejZrrX4BIPjJltj0p-JSAEG7ib4wrSi0GoZOrYozQrmR9ZDCKTfjdjkNGX5JEwkF7q0yRkYqNXAPHvXCEo_uLAkfwdGQ6DFmOeSpteelM8eDHy3oua5IqeS_Cqqx',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA3rS8Lyhw13FvuTViItniI7cS4geLa97fWcRoyk2fml32j3Ueud0Ht70YjDjXBEud87mSmwSz3WCTNrsT0LNISVEv728RVde9qevZZABHOz6CAUaPaOleCFAdZIQf3h9YRjLJFfdOTH25nH44Mys7o2coKK5iyIjj_tMx8MR4oQF84KQgvbROZKKUk9vzBYB-1MZTct2oMzXuDylFENrO2H2X_NA-BjwzfO_SoZxng3SoEEeQe0GUxxH9HK-hb6WPFDGx_EXPtxJMU',
  ],
};

export default function EventDetailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const event     = location.state?.event ?? DEFAULT_EVENT;

  const {
    title, category, date, dateFull, time, location: venue,
    distance, points, attendees, img, about, organizer, avatars,
  } = event;

  const extraCount = Math.max(0, attendees - avatars.length);

  return (
    <div className="ed-root">
      <Navbar />

      <main className="ed-main">

        {/* ── Hero image ──────────────────────────────────────── */}
        <section className="ed-hero">
          <img src={img} alt={title} className="ed-hero-img" />
          <div className="ed-hero-overlay">
            <div className="ed-hero-tags">
              <span className="ed-tag category">{category}</span>
              <span className="ed-tag date">
                <span className="material-symbols-outlined">calendar_today</span>
                {date}
              </span>
            </div>
            <h1 className="ed-hero-title">{title}</h1>
          </div>
          <button className="ed-back-btn" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </section>

        <div className="ed-body-grid">

          {/* ── Left column: content ────────────────────────── */}
          <div className="ed-left">

            {/* About */}
            <div className="ed-card">
              <h2 className="ed-card-title">About the Event</h2>
              {about.map((p, i) => (
                <p key={i} className="ed-body-text">{p}</p>
              ))}
            </div>

            {/* Organizer */}
            <div className="ed-card ed-organizer">
              <div className="ed-org-avatar">
                <span className="material-symbols-outlined ed-org-icon"
                  style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
              <div className="ed-org-info">
                <h3 className="ed-org-name">
                  {organizer.name}
                  <span className="material-symbols-outlined ed-verified"
                    style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </h3>
                <p className="ed-org-type">{organizer.type}</p>
              </div>
              <button className="ed-follow-btn">Follow</button>
            </div>

            {/* Attendees */}
            <div className="ed-card">
              <div className="ed-attendees-header">
                <h3 className="ed-card-title">Attendees</h3>
                <span className="ed-attendees-count">{attendees} Joined</span>
              </div>
              <div className="ed-avatar-row">
                {avatars.map((src, i) => (
                  <img key={i} src={src} alt="Attendee" className="ed-avatar" />
                ))}
                {extraCount > 0 && (
                  <div className="ed-avatar ed-avatar-more">+{extraCount}</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right column: sidebar ───────────────────────── */}
          <div className="ed-right">

            {/* Info card */}
            <div className="ed-card ed-info-card">
              <div className="ed-info-row">
                <div className="ed-info-icon-wrap">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <h4 className="ed-info-label">Date &amp; Time</h4>
              </div>
              <div className="ed-info-detail">
                <p>{dateFull}</p>
                <p>{time}</p>
              </div>

              <div className="ed-info-divider" />

              <div className="ed-info-row">
                <div className="ed-info-icon-wrap">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <h4 className="ed-info-label">Location</h4>
              </div>
              <div className="ed-info-detail">
                <p>{venue}</p>
                <p className="ed-info-distance">
                  <span className="material-symbols-outlined">directions_walk</span>
                  {distance}
                </p>
              </div>
            </div>

            {/* Points reward card */}
            <div className="ed-reward-card">
              <div className="ed-reward-blob" />
              <div className="ed-reward-content">
                <div className="ed-reward-left">
                  <span className="ed-reward-earn">Earn</span>
                  <h3 className="ed-reward-pts">+{points} Eco Points</h3>
                </div>
                <div className="ed-reward-icon-wrap">
                  <span className="material-symbols-outlined ed-reward-icon">emoji_events</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="ed-actions">
              <button className="ed-rsvp-btn">
                RSVP Now
              </button>
              <button className="ed-cal-btn">
                <span className="material-symbols-outlined">calendar_add_on</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

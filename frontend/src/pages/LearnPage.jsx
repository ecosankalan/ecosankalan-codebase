import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/learn.css';

const FILTER_CATEGORIES = ['All', 'Upcycling', 'Plastic', 'Organic', 'E-waste', 'Metal', 'Paper'];

// Regular video content (non-upcycling)
const VIDEOS = [
  { id: 1, title: 'The Ultimate Guide to Sorting Plastic Waste at Home', category: 'Plastic', duration: '12:45',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt9QqWH98j_ZYCN2mAYbAOUOm-YQSYGeE2FSSv0hTIYbTGBtwoK7tMxDQEoXxjGRFUhtsL6mwVBEqdS6sIYyfqs2DcEE1ispHq2HeZXIAqj81xoTRAQjOyHdJ-Z3OxswvIJA6ljPbuqfpxSyQCh9jDpZvgp8cOUIB57U-afALwfmnse8o_-a4nVpNP3hG5unYrCzy_AfxDxNjKyqqyQ0AYsxaCBHI7ebWYNu9ceR4wT36IybeFpW2JY-YdkmRrhbzUy78zv12UWf7R' },
  { id: 2, title: 'Composting Basics: Turn Kitchen Scraps into Garden Gold', category: 'Organic', duration: '08:12',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-j4yM2OAA79D1VX2_-gxAsr2m1SblP3-rZ0jQuC-HZZSQ-CBGYLBaQCO1P6pqWhY1ZeUHopikRym73sSlNjnD74AdMzWOYMFftZBL56Vq5z4Ld_lN90sr4AP_vkMwlxLqvfJLmZ1jKb_mLIPNzNS2XnnkgGDYrittjbXUYhwGC8FGzY1qGu-ziYMrk8z3ug77WanaQrIj2iuQzRIYTm7T43GRfLbsH7vHdfFGBwSMRioiChhpWx3a1VP8ddujl2wZPZgZIFrGSLtV' },
  { id: 3, title: 'Why You Should Never Throw Electronics in the Trash', category: 'E-waste', duration: '15:30',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5jJtMEO62XcPT79TkutNy8e3s3yvRbZhXp-6vsDSrLpJrztKVmeNyLc2SX_FZHxUKTb6b99NeLaAiQPA57epdP93tv3X9oQ4WRVvkuEAUgTT2KXHDkmKr1YgxlAWiYHQx4D9jEXyvYGvlXuplY3D5kZYp78n59YZjva4mKkWlvp53BH6bhT__VNmpqZxCeo7n495mdMC27fe2Wu0ACtEWw0obhjMOFjrE25tCRoOl3gGgRKoTARug8NxwfyCKinv3Rrq-TSLO2j4K' },
];

const UPCYCLING_FEATURED = {
  title: 'Zero Waste Kitchen Guide', badge: 'Premium Guide', duration: '15 min',
  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAAlUaHCR23Ss6c1xta1ojQVrMckJd3Xadovct1gfdb20ATohKBfaIz8R8JLkmIBqXoYyqagg_etizJ9hq5ND2mB1hGWcKRnkjiV143rIFoCo9PwgWiRr227aMNixdQrUvY8NaloIjS6N_pSrEQ6mO1C_kwi8k8fFb-Ff__K38Scr4Dppc1I4HZYAmYPefnI-8M_VzLtT-k6qI2itlfioHtyFfDlOXX0UTfQQ3eXv0yJ-nNGrBzUhWvBX_C9AoDpJyjgki6F65ec6f',
  url: 'https://www.wikihow.com/Make-Compost',
};

// FR-26 Upcycling tutorials from research team doc
const UPCYCLING_TUTORIALS = [
  { id: 'u1', title: 'DIY Plastic Bottle Hanging Planter', difficulty: 'Easy', diffClass: 'easy',
    time: '10 mins', category: 'Plastic', type: 'Blog',
    thumb: 'https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg',
    url: 'https://www.wikihow.com/Make-a-Plastic-Bottle-Planter' },
  { id: 'u2', title: 'Reuse Plastic Bottles as Bird Feeders', difficulty: 'Easy', diffClass: 'easy',
    time: '15 mins', category: 'Plastic', type: 'YouTube',
    thumb: 'https://images.pexels.com/photos/1463530/pexels-photo-1463530.jpeg',
    url: 'https://www.youtube.com/watch?v=1D3R6Kx7M7I' },
  { id: 'u3', title: 'Plastic Bottle Desk Organizer', difficulty: 'Medium', diffClass: 'hard',
    time: '25 mins', category: 'Plastic', type: 'Blog',
    thumb: 'https://images.pexels.com/photos/4792730/pexels-photo-4792730.jpeg',
    url: 'https://www.instructables.com/Plastic-Bottle-Desk-Organizer/' },
  { id: 'u4', title: 'Handmade Newspaper Gift Bag', difficulty: 'Easy', diffClass: 'easy',
    time: '20 mins', category: 'Paper', type: 'YouTube',
    thumb: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg',
    url: 'https://www.youtube.com/watch?v=SPc8xHq6v5k' },
  { id: 'u5', title: 'DIY Cardboard Desk Organizer', difficulty: 'Medium', diffClass: 'hard',
    time: '30 mins', category: 'Paper', type: 'Blog',
    thumb: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg',
    url: 'https://www.instructables.com/Cardboard-Desk-Organizer/' },
  { id: 'u6', title: 'Decorative Wall Art from Waste Paper', difficulty: 'Medium', diffClass: 'hard',
    time: '40 mins', category: 'Paper', type: 'YouTube',
    thumb: 'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg',
    url: 'https://www.youtube.com/watch?v=Kj8R9gN2x6I' },
  { id: 'u7', title: 'Upcycle Tin Cans into Pen Holders', difficulty: 'Easy', diffClass: 'easy',
    time: '15 mins', category: 'Metal', type: 'Blog',
    thumb: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg',
    url: 'https://www.wikihow.com/Decorate-a-Tin-Can' },
  { id: 'u8', title: 'Creative Keyboard Key Craft Ideas', difficulty: 'Medium', diffClass: 'hard',
    time: '35 mins', category: 'E-waste', type: 'Blog',
    thumb: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
    url: 'https://www.instructables.com/Keyboard-Key-Art/' },
  { id: 'u9', title: 'DIY Decorative Mosaic from Old CDs', difficulty: 'Medium', diffClass: 'hard',
    time: '45 mins', category: 'E-waste', type: 'YouTube',
    thumb: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    url: 'https://www.youtube.com/watch?v=4jvT2m9M8xA' },
  { id: 'u10', title: 'Home Composting for Food Waste', difficulty: 'Easy', diffClass: 'easy',
    time: '10 mins', category: 'Organic', type: 'Blog',
    thumb: 'https://images.pexels.com/photos/4503268/pexels-photo-4503268.jpeg',
    url: 'https://www.wikihow.com/Make-Compost' },
];

export default function LearnPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const isUpcycling = activeCategory === 'Upcycling';

  // For regular videos: filter by category
  const filteredVideos = activeCategory === 'All' ? VIDEOS
    : isUpcycling ? []
    : VIDEOS.filter(v => v.category === activeCategory);

  // For upcycling tutorials: when on Upcycling tab show all; when on a specific category
  // tab show tutorials for that category (cross-category discovery)
  const filteredTutorials = isUpcycling
    ? UPCYCLING_TUTORIALS
    : activeCategory === 'All'
      ? []
      : UPCYCLING_TUTORIALS.filter(t => t.category === activeCategory);

  const showUpcyclingSection = isUpcycling || filteredTutorials.length > 0;

  const handleTutorialAction = (tutorial, action) => {
    window.open(tutorial.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="learn-root">
      <Navbar />
      <main className="learn-main">

        <section className="learn-header">
          <h2>Learn Waste Disposal</h2>
          <p>Watch, learn, and test your knowledge</p>
        </section>

        <section>
          <div className="learn-quiz-card">
            <div className="learn-quiz-left">
              <div>
                <h3>Take a Quick Quiz</h3>
                <p>Test what you've learned and earn eco points</p>
              </div>
              <div className="learn-quiz-badges">
                <span className="learn-quiz-badge">4 Quizzes Available</span>
                <span className="learn-quiz-badge">5 Questions Each</span>
              </div>
              <button className="learn-quiz-btn" onClick={() => navigate('/quiz')}>Start Quiz</button>
            </div>
            <div className="learn-quiz-divider" />
            <div className="learn-quiz-right">
              <span className="learn-quiz-reward-label">Reward</span>
              <span className="learn-quiz-points">+50 Points</span>
              <div className="learn-quiz-badge-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
              <span className="learn-quiz-badge-name">Quiz Starter</span>
            </div>
          </div>
        </section>

        {/* Filter chips */}
        <div className="learn-filter-scroll-wrap">
          <div className="learn-filter-scroll">
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`learn-filter-pill${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Upcycling featured card (only on Upcycling tab) ── */}
        {isUpcycling && (
          <section className="learn-upcycle-featured">
            <div className="learn-upcycle-featured-card" onClick={() => window.open(UPCYCLING_FEATURED.url, '_blank', 'noopener,noreferrer')}>
              <img src={UPCYCLING_FEATURED.img} alt={UPCYCLING_FEATURED.title} className="learn-upcycle-featured-img" />
              <div className="learn-upcycle-featured-overlay" />
              <div className="learn-upcycle-featured-content">
                <div className="learn-upcycle-badges-row">
                  <span className="learn-upcycle-premium-badge">{UPCYCLING_FEATURED.badge}</span>
                  <span className="learn-upcycle-duration">
                    <span className="material-symbols-outlined">schedule</span>
                    {UPCYCLING_FEATURED.duration}
                  </span>
                </div>
                <h3 className="learn-upcycle-featured-title">{UPCYCLING_FEATURED.title}</h3>
                <div className="learn-upcycle-play-row">
                  <div className="learn-upcycle-play-btn">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                  <span className="learn-upcycle-start-label">Start Learning</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Upcycling tutorials (Upcycling tab = all; category tabs = filtered) ── */}
        {showUpcyclingSection && (
          <section className="learn-upcycle-list-section">
            <h4 className="learn-upcycle-list-title">
              {isUpcycling ? 'All Tutorials' : `Upcycling — ${activeCategory}`}
            </h4>
            <div className="learn-upcycle-list">
              {filteredTutorials.map(t => (
                <div className="learn-upcycle-card" key={t.id}>
                  <div className="learn-upcycle-card-top">
                    <div className="learn-upcycle-thumb">
                      <img src={t.thumb} alt={t.title} className="learn-upcycle-thumb-img" />
                    </div>
                    <div className="learn-upcycle-card-info">
                      <div className="learn-upcycle-meta-row">
                        <span className={`learn-upcycle-diff ${t.diffClass}`}>{t.difficulty}</span>
                        <span className="learn-upcycle-time">{t.time}</span>
                        <span className="learn-upcycle-cat-tag">{t.category}</span>
                      </div>
                      <h5 className="learn-upcycle-card-title">{t.title}</h5>
                    </div>
                  </div>
                  <div className="learn-upcycle-card-actions">
                    {t.type === 'YouTube' ? (
                      <button className="learn-upcycle-watch-btn" onClick={() => handleTutorialAction(t, 'watch')}>
                        <span className="material-symbols-outlined">smart_display</span>
                        Watch Video
                      </button>
                    ) : (
                      <button className="learn-upcycle-read-btn" onClick={() => handleTutorialAction(t, 'read')}>
                        <span className="material-symbols-outlined">menu_book</span>
                        Read Guide
                      </button>
                    )}
                    <button className="learn-upcycle-read-btn" onClick={() => handleTutorialAction(t, 'read')}>
                      <span className="material-symbols-outlined">open_in_new</span>
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Regular videos ── */}
        {!isUpcycling && filteredVideos.length > 0 && (
          <div className="learn-video-list">
            {filteredVideos.map(video => (
              <div className="learn-video-card" key={video.id}>
                <div className="learn-video-thumb">
                  <img src={video.img} alt={video.title} />
                  <div className="learn-video-overlay">
                    <div className="learn-play-btn">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </div>
                  </div>
                  <span className="learn-video-duration">{video.duration}</span>
                </div>
                <div className="learn-video-meta">
                  <div className="learn-video-tags">
                    <span className="learn-video-category">{video.category}</span>
                    <span className="learn-video-source">
                      <span className="material-symbols-outlined">smart_display</span>
                      YouTube
                    </span>
                  </div>
                  <h4 className="learn-video-title">{video.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isUpcycling && filteredVideos.length === 0 && filteredTutorials.length === 0 && (
          <div className="learn-empty-state">
            <span className="material-symbols-outlined learn-empty-icon">search_off</span>
            <p>No content found for "{activeCategory}" yet.</p>
            <button className="learn-filter-pill active" onClick={() => setActiveCategory('All')}>Show All</button>
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}

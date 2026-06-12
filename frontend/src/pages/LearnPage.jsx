import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import '../styles/learn.css';

const CATEGORIES = ['All', 'Plastic', 'Organic', 'E-waste', 'Metal', 'Paper'];

const VIDEOS = [
  {
    id: 1,
    title: 'The Ultimate Guide to Sorting Plastic Waste at Home',
    category: 'Plastic',
    duration: '12:45',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt9QqWH98j_ZYCN2mAYbAOUOm-YQSYGeE2FSSv0hTIYbTGBtwoK7tMxDQEoXxjGRFUhtsL6mwVBEqdS6sIYyfqs2DcEE1ispHq2HeZXIAqj81xoTRAQjOyHdJ-Z3OxswvIJA6ljPbuqfpxSyQCh9jDpZvgp8cOUIB57U-afALwfmnse8o_-a4nVpNP3hG5unYrCzy_AfxDxNjKyqqyQ0AYsxaCBHI7ebWYNu9ceR4wT36IybeFpW2JY-YdkmRrhbzUy78zv12UWf7R',
  },
  {
    id: 2,
    title: 'Composting Basics: Turn Kitchen Scraps into Garden Gold',
    category: 'Organic',
    duration: '08:12',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-j4yM2OAA79D1VX2_-gxAsr2m1SblP3-rZ0jQuC-HZZSQ-CBGYLBaQCO1P6pqWhY1ZeUHopikRym73sSlNjnD74AdMzWOYMFftZBL56Vq5z4Ld_lN90sr4AP_vkMwlxLqvfJLmZ1jKb_mLIPNzNS2XnnkgGDYrittjbXUYhwGC8FGzY1qGu-ziYMrk8z3ug77WanaQrIj2iuQzRIYTm7T43GRfLbsH7vHdfFGBwSMRioiChhpWx3a1VP8ddujl2wZPZgZIFrGSLtV',
  },
  {
    id: 3,
    title: 'Why You Should Never Throw Electronics in the Trash',
    category: 'E-waste',
    duration: '15:30',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5jJtMEO62XcPT79TkutNy8e3s3yvRbZhXp-6vsDSrLpJrztKVmeNyLc2SX_FZHxUKTb6b99NeLaAiQPA57epdP93tv3X9oQ4WRVvkuEAUgTT2KXHDkmKr1YgxlAWiYHQx4D9jEXyvYGvlXuplY3D5kZYp78n59YZjva4mKkWlvp53BH6bhT__VNmpqZxCeo7n495mdMC27fe2Wu0ACtEWw0obhjMOFjrE25tCRoOl3gGgRKoTARug8NxwfyCKinv3Rrq-TSLO2j4K',
  },
];

export default function LearnPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? VIDEOS
    : VIDEOS.filter(v => v.category === activeCategory);

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
                <span className="learn-quiz-badge">Level: Beginner</span>
                <span className="learn-quiz-badge">Topic: Plastic Waste</span>
              </div>
              <button className="learn-quiz-btn" onClick={() => navigate('/quiz')}>Start Quiz</button>
            </div>
            <div className="learn-quiz-divider" />
            <div className="learn-quiz-right">
              <span className="learn-quiz-reward-label">Reward</span>
              <span className="learn-quiz-points">+50 Points</span>
              <div className="learn-quiz-badge-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
              </div>
              <span className="learn-quiz-badge-name">Quiz Starter</span>
            </div>
          </div>
        </section>

        <div className="learn-filter-scroll-wrap">
          <div className="learn-filter-scroll">
            {CATEGORIES.map(cat => (
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

        <div className="learn-video-list">
          {filtered.map(video => (
            <div className="learn-video-card" key={video.id}>
              <div className="learn-video-thumb">
                <img src={video.img} alt={video.title} />
                <div className="learn-video-overlay">
                  <div className="learn-play-btn">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
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
      </main>
      <BottomNav />
    </div>
  );
}

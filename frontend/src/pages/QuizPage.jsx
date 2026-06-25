/**
 * QuizPage — 4 quizzes × 5 questions each from research team doc
 * Quiz selection → questions → /quiz-result
 * Results saved to localStorage for ProfilePage to read
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/quiz.css';

const QUIZZES = [
  {
    id: 'quiz-plastic',
    title: 'Plastic Waste',
    icon: 'inventory_2',
    color: '#1b6b3a',
    badge: 'Plastic Expert',
    questions: [
      {
        category: 'Plastic', text: 'What is your favorite colorful, snap-together building block toy usually made out of?',
        options: [{ id: 'A', text: 'Soft, squishy jelly' }, { id: 'B', text: 'Hard, shiny plastic' }, { id: 'C', text: 'Crumbly dirt' }, { id: 'D', text: 'Wet paper' }],
        correctId: 'B', explanation: 'Plastic is tough and lasts forever. Don\'t throw toys away; share them so they don\'t sit in dirt forever!',
      },
      {
        category: 'Plastic', text: 'Before you throw away the plastic rings that hold soda cans together, what is the best thing to do?',
        options: [{ id: 'A', text: 'Paint them a different color' }, { id: 'B', text: 'Cut every single circle with scissors' }, { id: 'C', text: 'Melt them in the microwave' }, { id: 'D', text: 'Tie them into a big knot' }],
        correctId: 'B', explanation: 'Snip those rings! Animals get stuck in them. Taking two seconds with scissors can literally save a turtle\'s life.',
      },
      {
        category: 'Plastic', text: 'Why is it incredibly difficult to recycle all plastic waste into a single, mixed batch?',
        options: [{ id: 'A', text: 'Different plastics have different melting points and chemical structures' }, { id: 'B', text: 'Plastic becomes highly explosive when mixed together' }, { id: 'C', text: 'Recycling machines only accept the color clear' }, { id: 'D', text: 'The government legally prohibits mixing plastics' }],
        correctId: 'A', explanation: 'Different plastics have completely different chemical structures and melting points. Melting them together creates useless sludge.',
      },
      {
        category: 'Plastic', text: 'Scientists discovered something in the Amazon rainforest that can eat and digest toxic plastics like polyurethane. What is it?',
        options: [{ id: 'A', text: 'A rare species of parrot' }, { id: 'B', text: 'A genetically mutated earthworm' }, { id: 'C', text: 'A specific type of mushroom/fungus' }, { id: 'D', text: 'A specialized tree sap' }],
        correctId: 'C', explanation: 'Wild fact: A rare Amazonian mushroom can actually eat and digest toxic polyurethane plastic without even needing oxygen!',
      },
      {
        category: 'Plastic', text: 'Which symbol on the bottom of a plastic bottle tells you it is PET plastic (Type 1), the most commonly recycled type?',
        options: [{ id: 'A', text: 'A triangle with the number 5 inside' }, { id: 'B', text: 'A triangle with the number 1 inside' }, { id: 'C', text: 'A star with the letter P inside' }, { id: 'D', text: 'A circle with arrows inside' }],
        correctId: 'B', explanation: 'The number inside the recycling triangle is the resin code. #1 (PET) is water bottles; it\'s the most widely accepted by recyclers.',
      },
    ],
  },
  {
    id: 'quiz-organic',
    title: 'Organic Waste',
    icon: 'compost',
    color: '#005127',
    badge: 'Compost Champion',
    questions: [
      {
        category: 'Organic', text: 'Which of these things used to be part of a living plant and can be put back into the dirt to help plants grow?',
        options: [{ id: 'A', text: 'A glass window' }, { id: 'B', text: 'A smelly banana peel' }, { id: 'C', text: 'A plastic action figure' }, { id: 'D', text: 'A metal coin' }],
        correctId: 'B', explanation: 'Banana peels were once alive! Bury them, and tiny bugs turn them into magic plant food for the garden.',
      },
      {
        category: 'Organic', text: 'What creature is famous for eating leftover food scraps and producing nutrient-rich soil for gardens?',
        options: [{ id: 'A', text: 'Spiders' }, { id: 'B', text: 'Earthworms' }, { id: 'C', text: 'Butterflies' }, { id: 'D', text: 'Frogs' }],
        correctId: 'B', explanation: 'Earthworms are nature\'s garbage disposals. They eat your kitchen scraps and poop out amazing, nutrient-rich dirt!',
      },
      {
        category: 'Organic', text: 'Why is throwing organic food waste into a standard landfill a massive contributor to climate change?',
        options: [{ id: 'A', text: 'It attracts radioactive wildlife' }, { id: 'B', text: 'It produces methane gas because it decomposes without oxygen' }, { id: 'C', text: 'It permanently destroys the ozone layer' }, { id: 'D', text: 'It catches on fire spontaneously' }],
        correctId: 'B', explanation: 'Buried under trash without oxygen, food waste rots anaerobically and releases methane, a potent greenhouse gas.',
      },
      {
        category: 'Organic', text: 'Which organic waste item should NOT go in a home compost bin?',
        options: [{ id: 'A', text: 'Coffee grounds' }, { id: 'B', text: 'Fruit peels' }, { id: 'C', text: 'Meat and dairy products' }, { id: 'D', text: 'Dried leaves' }],
        correctId: 'C', explanation: 'Meat and dairy attract pests and create foul odors in home compost bins. They need industrial composting facilities.',
      },
      {
        category: 'Organic', text: 'Approximately what percentage of household waste in most countries is organic food waste?',
        options: [{ id: 'A', text: '10–15%' }, { id: 'B', text: '20–30%' }, { id: 'C', text: '40–50%' }, { id: 'D', text: '70–80%' }],
        correctId: 'C', explanation: 'Organic waste typically makes up 40–50% of household garbage — making home composting one of the highest-impact actions a family can take.',
      },
    ],
  },
  {
    id: 'quiz-ewaste',
    title: 'E-Waste & Metal',
    icon: 'devices_other',
    color: '#782c39',
    badge: 'Tech Recycler',
    questions: [
      {
        category: 'E-Waste', text: 'Your old video game controller is broken and won\'t turn on. What is the smartest thing to do with it?',
        options: [{ id: 'A', text: 'Bury it in the backyard' }, { id: 'B', text: 'Throw it in the regular kitchen trash' }, { id: 'C', text: 'Take it to a special electronics recycling drop-off' }, { id: 'D', text: 'Flush it down the toilet' }],
        correctId: 'C', explanation: 'Broken electronics contain toxic chemicals like lead. Drop them at special recycling centers so they don\'t poison our soil!',
      },
      {
        category: 'E-Waste', text: 'Tech companies design smartphones with glued-in batteries or proprietary screws so you can\'t repair them easily. What is this strategy called?',
        options: [{ id: 'A', text: 'Sustainable engineering' }, { id: 'B', text: 'Planned obsolescence' }, { id: 'C', text: 'Open-source manufacturing' }, { id: 'D', text: 'Circular economics' }],
        correctId: 'B', explanation: '"Planned obsolescence" is when companies use glued-in batteries or custom screws to stop repairs, forcing new purchases.',
      },
      {
        category: 'E-Waste', text: 'During the 2020 Tokyo Olympics, Japan did something amazing with donated e-waste. What did they create from it?',
        options: [{ id: 'A', text: 'The entire Olympic stadium' }, { id: 'B', text: 'The athletes\' running shoes' }, { id: 'C', text: 'The gold, silver, and bronze medals' }, { id: 'D', text: 'The Olympic torch' }],
        correctId: 'C', explanation: 'Japan forged all 5,000 medals for the 2020 Tokyo Olympics by extracting precious metals from millions of donated phones!',
      },
      {
        category: 'Metal', text: 'Why is recycling aluminum so heavily prioritized by environmentalists compared to manufacturing new aluminum?',
        options: [{ id: 'A', text: 'New aluminum requires cutting down endangered rainforests' }, { id: 'B', text: 'Recycling aluminum saves about 95% of the massive energy needed to refine it from raw ore' }, { id: 'C', text: 'Raw aluminum is highly radioactive until recycled' }, { id: 'D', text: 'There is absolutely no raw aluminum left on Earth' }],
        correctId: 'B', explanation: 'Recycling aluminum saves 95% of the massive, polluting energy required to mine and refine raw bauxite ore.',
      },
      {
        category: 'Metal', text: 'Roughly what percentage of ALL aluminum ever made is still being used today?',
        options: [{ id: 'A', text: '10%' }, { id: 'B', text: '25%' }, { id: 'C', text: '50%' }, { id: 'D', text: 'Nearly 75%' }],
        correctId: 'D', explanation: 'Aluminum is infinitely recyclable without losing quality. Nearly 75% of all aluminum ever produced is still in use today!',
      },
    ],
  },
  {
    id: 'quiz-paper',
    title: 'Paper & Other',
    icon: 'description',
    color: '#1b6b3a',
    badge: 'Paper Sage',
    questions: [
      {
        category: 'Paper', text: 'You just finished eating a greasy pepperoni pizza. Why shouldn\'t the greasy bottom half of the box go into the recycling bin?',
        options: [{ id: 'A', text: 'The recycling machine is allergic to pepperoni' }, { id: 'B', text: 'The grease and oil will completely ruin the new paper being made' }, { id: 'C', text: 'Cardboard is too heavy to be recycled' }, { id: 'D', text: 'The pizza smell attracts bears to the recycling plant' }],
        correctId: 'B', explanation: 'Oil and water don\'t mix! Greasy pizza boxes ruin the water-based paper recycling process. Toss the greasy half.',
      },
      {
        category: 'Paper', text: 'What physically happens to paper fibers every time it goes through the recycling process?',
        options: [{ id: 'A', text: 'It becomes highly radioactive' }, { id: 'B', text: 'The paper fibers get physically shorter and weaker' }, { id: 'C', text: 'It chemically transforms into a plastic polymer' }, { id: 'D', text: 'It becomes too thick to bend' }],
        correctId: 'B', explanation: 'Paper fibers physically shorten and weaken with each mechanical pulping cycle, becoming useless paste after 5–7 times.',
      },
      {
        category: 'Paper', text: 'Some innovative companies make beautiful, odor-free paper out of the poop of which giant animal?',
        options: [{ id: 'A', text: 'Blue Whales' }, { id: 'B', text: 'Elephants' }, { id: 'C', text: 'T-Rex dinosaurs' }, { id: 'D', text: 'Giraffes' }],
        correctId: 'B', explanation: 'Elephants eat lots of grass, so their poop is full of plant fibers! Companies wash it to make beautiful paper.',
      },
      {
        category: 'Other', text: 'Your favorite pair of jeans doesn\'t fit anymore but they still look new. What is the best thing to do?',
        options: [{ id: 'A', text: 'Throw them in the regular garbage' }, { id: 'B', text: 'Burn them in a campfire' }, { id: 'C', text: 'Donate them to a thrift store or a younger friend' }, { id: 'D', text: 'Cut them into tiny pieces and flush them' }],
        correctId: 'C', explanation: 'Making clothes uses tons of water. Don\'t trash old jeans; donate them to a thrift store for a second life!',
      },
      {
        category: 'Other', text: 'If someone tosses an empty glass bottle into the woods, roughly how long will the earth take to decompose it?',
        options: [{ id: 'A', text: '10 years' }, { id: 'B', text: '500 years' }, { id: 'C', text: '10,000 years' }, { id: 'D', text: 'Over 1 million years' }],
        correctId: 'D', explanation: 'Glass never rots. A discarded bottle takes over a million years to decompose, yet it is 100% infinitely recyclable!',
      },
    ],
  },
];

// Persist quiz results to localStorage for ProfilePage
function saveQuizResult(quizId, score, total) {
  try {
    const existing = JSON.parse(localStorage.getItem('quiz_results') || '{}');
    existing[quizId] = { score, total, completedAt: new Date().toISOString() };
    localStorage.setItem('quiz_results', JSON.stringify(existing));
  } catch (_) {}
}

export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // If a quiz ID is passed via state, start that quiz directly
  const preselectedId = location.state?.quizId ?? null;

  const [selectedQuizId, setSelectedQuizId] = useState(preselectedId);
  const [currentQ,  setCurrentQ]  = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed,   setElapsed]   = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const quiz = QUIZZES.find(q => q.id === selectedQuizId);
  const question = quiz ? quiz.questions[currentQ] : null;
  const TOTAL = 5;

  const fillPct = Math.round(((currentQ + (revealed ? 1 : 0)) / TOTAL) * 100);

  const handleSelect = (optId) => { if (!revealed) setSelected(optId); };

  const handleContinue = () => {
    if (!revealed) {
      setRevealed(true);
      if (selected === question.correctId) setScore(s => s + 1);
      return;
    }
    const newScore = revealed && selected === question.correctId ? score + (score === currentQ ? 0 : 0) : score;
    const finalScore = selected === question.correctId ? score + 1 : score;
    const nextQ = currentQ + 1;
    if (nextQ >= TOTAL) {
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      saveQuizResult(quiz.id, finalScore, TOTAL);
      navigate('/quiz-result', {
        state: { score: finalScore, total: TOTAL, time: `${mins}:${secs.toString().padStart(2, '0')}`, points: 50, quizTitle: quiz.title, badge: quiz.badge },
        replace: true,
      });
      return;
    }
    setCurrentQ(nextQ);
    setSelected(null);
    setRevealed(false);
  };

  const handleSkip = () => {
    const nextQ = currentQ + 1;
    if (nextQ >= TOTAL) {
      saveQuizResult(quiz.id, score, TOTAL);
      navigate('/quiz-result', {
        state: { score, total: TOTAL, time: '0:00', points: score * 10, quizTitle: quiz.title, badge: quiz.badge },
        replace: true,
      });
      return;
    }
    setCurrentQ(nextQ);
    setSelected(null);
    setRevealed(false);
  };

  const getOptionState = (optId) => {
    if (!revealed) return selected === optId ? 'selected' : 'default';
    if (optId === question.correctId) return 'correct';
    if (optId === selected && selected !== question.correctId) return 'wrong';
    return 'default';
  };

  const continueLabel = !selected ? 'Select an answer'
    : !revealed ? 'Confirm Answer'
    : currentQ + 1 >= TOTAL ? 'See Results' : 'Next Question';

  // ── Quiz selection screen ──
  if (!selectedQuizId) {
    const savedResults = (() => { try { return JSON.parse(localStorage.getItem('quiz_results') || '{}'); } catch { return {}; } })();
    return (
      <div className="quiz-root">
        <header className="quiz-topbar">
          <div className="quiz-topbar-brand">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            EcoSankalan
          </div>
          <button className="quiz-close-btn" onClick={() => navigate('/learn')} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <main className="quiz-main">
          <div className="quiz-select-header">
            <h2 className="quiz-select-title">Choose a Quiz</h2>
            <p className="quiz-select-sub">5 questions • Earn up to 50 eco points each</p>
          </div>
          <div className="quiz-select-grid">
            {QUIZZES.map(q => {
              const result = savedResults[q.id];
              return (
                <button key={q.id} className="quiz-select-card" onClick={() => setSelectedQuizId(q.id)}>
                  <div className="quiz-select-icon-wrap" style={{ background: q.color + '18' }}>
                    <span className="material-symbols-outlined" style={{ color: q.color, fontVariationSettings: "'FILL' 1", fontSize: '2rem' }}>{q.icon}</span>
                  </div>
                  <div className="quiz-select-info">
                    <h3 className="quiz-select-name">{q.title}</h3>
                    <p className="quiz-select-meta">5 questions • Badge: {q.badge}</p>
                    {result && (
                      <span className="quiz-select-done">
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {result.score}/{result.total} last attempt
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-outlined quiz-select-arrow">chevron_right</span>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ── Active quiz screen ──
  return (
    <div className="quiz-root">
      <header className="quiz-topbar">
        <div className="quiz-topbar-brand">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          {quiz.title}
        </div>
        <button className="quiz-close-btn" onClick={() => { setSelectedQuizId(null); setCurrentQ(0); setSelected(null); setRevealed(false); setScore(0); }} aria-label="Back to quiz list">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="quiz-main">
        <section className="quiz-progress-section">
          <div className="quiz-progress-header">
            <div className="quiz-progress-meta">
              <span className="quiz-progress-category">{question.category}</span>
              <h2 className="quiz-progress-question">Question {currentQ + 1} of {TOTAL}</h2>
            </div>
            <span className="quiz-progress-pct">{fillPct}% Complete</span>
          </div>
          <div className="quiz-progress-bar-track">
            <div className="quiz-progress-bar-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </section>

        <article className="quiz-question-card">
          <p className="quiz-question-text">{question.text}</p>
        </article>

        <div className="quiz-options">
          {question.options.map(opt => {
            const state = getOptionState(opt.id);
            return (
              <button key={opt.id} className={`quiz-option ${state}`} onClick={() => handleSelect(opt.id)} disabled={revealed}>
                <div className="quiz-option-letter">{opt.id}</div>
                <span className="quiz-option-text">{opt.text}</span>
                {state === 'selected' && <span className="material-symbols-outlined quiz-option-check" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                {state === 'correct' && <span className="material-symbols-outlined quiz-option-check" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--secondary)', opacity: 1 }}>check_circle</span>}
                {state === 'wrong' && <span className="material-symbols-outlined quiz-option-check" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--error)', opacity: 1 }}>cancel</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation shown after reveal */}
        {revealed && (
          <div className={`quiz-explanation ${selected === question.correctId ? 'correct' : 'wrong'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {selected === question.correctId ? 'check_circle' : 'info'}
            </span>
            <p>{question.explanation}</p>
          </div>
        )}
      </main>

      <footer className="quiz-action-bar">
        <div className="quiz-action-inner">
          <button className="quiz-skip-btn" onClick={handleSkip}>Skip</button>
          <button className="quiz-continue-btn" onClick={handleContinue} disabled={!selected}>
            {continueLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

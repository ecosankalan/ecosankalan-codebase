/**
 * QuizPage — static 5-question quiz (repeats same question for demo)
 * Opened from: LearnPage → learn-quiz-btn
 * On finish: navigates to /quiz-result
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/quiz.css';

const TOTAL_QUESTIONS = 5;

// Static question repeated for all 5 slots (backend/question bank in future)
const STATIC_QUESTION = {
  category: 'Environmental Basics',
  text: 'Which of the following describes the most effective way to reduce individual carbon footprint through waste management?',
  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuTztQ9n8OzWETXMis6gzEpmsgTMZsmVJYziyS9Rz4fZAWCK0fnUhF8CzTC7advfMBpxvb3wFrKr6Vo9l_gjIeY8KaLtbpkTWAAlaP7FfAZPpNZCznBfCzFIJDTNhM5Ou-qguKFlRWnbH9T9VVxGPr0ds5QG3AK81j_ecvFvwhU-hXn-iNeCVYOmfLy4WSlYB7zis6-g9lnb7GZMVIPJObmk8pBZBOr_DB5CJChoPs6Ym3ytk0-lOh97Qo3r5LvNI22C6zSqM5i_Q',
  options: [
    { id: 'A', text: 'Burning all household waste in a backyard pit' },
    { id: 'B', text: 'Implementing a "Reduce, Reuse, Recycle" system at home' },
    { id: 'C', text: 'Composting organic matter to enrich local soil' },
    { id: 'D', text: 'Sending all plastics to landfills once a week' },
  ],
  correctId: 'B',
};

export default function QuizPage() {
  const navigate = useNavigate();

  const [currentQ,  setCurrentQ]  = useState(0);   // 0-indexed
  const [selected,  setSelected]  = useState(null); // option id
  const [revealed,  setRevealed]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed,   setElapsed]   = useState(0);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const pct     = Math.round(((currentQ) / TOTAL_QUESTIONS) * 100);
  const fillPct = Math.round(((currentQ + (revealed ? 1 : 0)) / TOTAL_QUESTIONS) * 100);

  const handleSelect = (optId) => {
    if (revealed) return;
    setSelected(optId);
  };

  const handleContinue = () => {
    if (!revealed) {
      // First press: reveal answer
      setRevealed(true);
      if (selected === STATIC_QUESTION.correctId) {
        setScore(s => s + 1);
      }
      return;
    }
    // Second press: advance
    const nextQ = currentQ + 1;
    if (nextQ >= TOTAL_QUESTIONS) {
      const mins  = Math.floor(elapsed / 60);
      const secs  = elapsed % 60;
      const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
      navigate('/quiz-result', {
        state: {
          score:   revealed && selected === STATIC_QUESTION.correctId ? score + 1 : score,
          total:   TOTAL_QUESTIONS,
          time:    timeStr,
          points:  50,
        },
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
    if (nextQ >= TOTAL_QUESTIONS) {
      navigate('/quiz-result', {
        state: { score, total: TOTAL_QUESTIONS, time: '0:00', points: 50 },
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
    if (optId === STATIC_QUESTION.correctId) return 'correct';
    if (optId === selected && selected !== STATIC_QUESTION.correctId) return 'wrong';
    return 'default';
  };

  const continueLabel = !selected
    ? 'Select an answer'
    : !revealed
      ? 'Confirm Answer'
      : currentQ + 1 >= TOTAL_QUESTIONS
        ? 'See Results'
        : 'Next Question';

  return (
    <div className="quiz-root">

      {/* Top bar */}
      <header className="quiz-topbar">
        <div className="quiz-topbar-brand">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          EcoSankalan
        </div>
        <button
          className="quiz-close-btn"
          onClick={() => navigate('/learn')}
          aria-label="Close quiz"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="quiz-main">

        {/* Progress */}
        <section className="quiz-progress-section">
          <div className="quiz-progress-header">
            <div className="quiz-progress-meta">
              <span className="quiz-progress-category">{STATIC_QUESTION.category}</span>
              <h2 className="quiz-progress-question">
                Question {currentQ + 1} of {TOTAL_QUESTIONS}
              </h2>
            </div>
            <span className="quiz-progress-pct">{fillPct}% Complete</span>
          </div>
          <div className="quiz-progress-bar-track">
            <div
              className="quiz-progress-bar-fill"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </section>

        {/* Question card */}
        <article className="quiz-question-card">
          <div className="quiz-question-img">
            <img src={STATIC_QUESTION.img} alt="Question visual" />
          </div>
          <p className="quiz-question-text">{STATIC_QUESTION.text}</p>
        </article>

        {/* Options */}
        <div className="quiz-options">
          {STATIC_QUESTION.options.map(opt => {
            const state = getOptionState(opt.id);
            return (
              <button
                key={opt.id}
                className={`quiz-option ${state}`}
                onClick={() => handleSelect(opt.id)}
                disabled={revealed}
              >
                <div className="quiz-option-letter">{opt.id}</div>
                <span className="quiz-option-text">{opt.text}</span>
                {state === 'selected' && (
                  <span
                    className="material-symbols-outlined quiz-option-check"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
                {state === 'correct' && (
                  <span
                    className="material-symbols-outlined quiz-option-check"
                    style={{ fontVariationSettings: "'FILL' 1", color: 'var(--secondary)', opacity: 1 }}
                  >
                    check_circle
                  </span>
                )}
                {state === 'wrong' && (
                  <span
                    className="material-symbols-outlined quiz-option-check"
                    style={{ fontVariationSettings: "'FILL' 1", color: 'var(--error)', opacity: 1 }}
                  >
                    cancel
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </main>

      {/* Bottom action bar */}
      <footer className="quiz-action-bar">
        <div className="quiz-action-inner">
          <button className="quiz-skip-btn" onClick={handleSkip}>
            Skip
          </button>
          <button
            className="quiz-continue-btn"
            onClick={handleContinue}
            disabled={!selected}
          >
            {continueLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

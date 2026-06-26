import { useState, useEffect } from 'react';

const TUTORIAL_STEPS = [
  {
    title: "Welcome to EcoSankalan!",
    content: "Your journey towards a greener future starts here. Let's take a quick tour of how you can make an impact.",
    icon: "eco"
  },
  {
    title: "Log Your Waste",
    content: "Tap the big green Camera icon at the bottom anytime to scan and log your recyclable waste using AI.",
    icon: "photo_camera"
  },
  {
    title: "Earn & Redeem",
    content: "Every log earns you EcoPoints. Head over to the Shop to redeem them for exciting vouchers from our partners!",
    icon: "shopping_bag"
  },
  {
    title: "Join the Community",
    content: "Check the Map to find nearby bins and RSVP to local cleanup events with fellow eco-warriors.",
    icon: "map"
  }
];

export default function TutorialOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if tutorial has been seen on this device
    try {
      const seen = localStorage.getItem('tutorialSeen');
      if (!seen) {
        // Small delay to let the dashboard render first
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('localStorage not accessible', e);
    }
  }, []);

  if (!isVisible) return null;

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem('tutorialSeen', 'true');
      setIsVisible(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorialSeen', 'true');
    setIsVisible(false);
  };

  const currentInfo = TUTORIAL_STEPS[step];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 33, 12, 0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '24px',
        padding: '2rem 1.5rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease-out forwards'
      }}>
        <style>{`
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
        
        <div style={{
          width: '64px', height: '64px',
          background: 'var(--primary-container)',
          color: 'var(--on-primary-container)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>{currentInfo.icon}</span>
        </div>
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--on-surface)' }}>{currentInfo.title}</h2>
        <p style={{ color: 'var(--outline)', lineHeight: 1.5, marginBottom: '2rem', minHeight: '60px' }}>
          {currentInfo.content}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === step ? 'var(--primary)' : 'var(--surface-variant)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleSkip}
            style={{ flex: 1, padding: '0.875rem', background: 'transparent', color: 'var(--outline)', border: 'none', fontWeight: 'bold' }}
          >
            Skip
          </button>
          <button 
            onClick={handleNext}
            style={{ flex: 2, padding: '0.875rem', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
          >
            {step === TUTORIAL_STEPS.length - 1 ? "Let's Go!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

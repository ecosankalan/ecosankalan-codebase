import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'radial-gradient(800px 300px at 50% -60px, rgba(170,204,0,.25), transparent 60%), #f4f8f1',
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        }}>
          <div style={{
            maxWidth: '460px',
            width: '100%',
            background: '#fff',
            borderRadius: '28px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            border: '1px solid #d9e6cf',
            boxShadow: '0 18px 50px rgba(0,70,52,.12)',
          }}>
            <div style={{
              width: '64px', height: '64px', margin: '0 auto 1.25rem',
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#2b9348,#004634)', color: '#aacc00', fontSize: '2rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>eco</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#101815', marginBottom: '.5rem' }}>
              Something went off track
            </h2>
            <p style={{ fontSize: '.9rem', color: '#6b756a', lineHeight: 1.6, marginBottom: '1rem' }}>
              The app hit an unexpected error. Your data is safe — try reloading to get back on track.
            </p>
            <p style={{ background: '#fdecec', border: '1px solid #fecaca', color: '#7f1d1d', padding: '.75rem 1rem', borderRadius: '12px', overflowX: 'auto', fontSize: '.8rem', marginBottom: '1.25rem' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ background: '#007f5f', color: '#fff', border: 0, borderRadius: '14px', padding: '.75rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Reload app
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                style={{ background: '#fff', color: '#007f5f', border: '1.5px solid rgba(0,70,52,.3)', borderRadius: '14px', padding: '.75rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

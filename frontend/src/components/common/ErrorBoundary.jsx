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
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <p style={{ background: '#ffeeee', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

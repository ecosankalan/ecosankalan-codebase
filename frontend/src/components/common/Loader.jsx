import React from 'react';
import '../../styles/loader.css';

export default function Loader({ text = 'Growing your green dashboard…' }) {
  return (
    <div className="ecosankalan-loader-wrap" role="status" aria-live="polite">
      <div className="ecosankalan-loader-stage" aria-hidden="true">
        <span className="ecosankalan-loader-halo" />
        <div className="ecosankalan-loader-orbit">
          <span className="ecosankalan-loader-sat" />
        </div>
        <span className="ecosankalan-loader-core">
          <span className="material-symbols-outlined">eco</span>
        </span>
      </div>
      <p className="ecosankalan-loader-text">{text}</p>
      <div className="ecosankalan-loader-bar" aria-hidden="true"><span /></div>
    </div>
  );
}

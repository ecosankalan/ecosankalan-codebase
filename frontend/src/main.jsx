import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './i18n';
import { isFirebaseConfigured } from './lib/firebase';

if (isFirebaseConfigured && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("SW Registered:", registration);
    })
    .catch(console.error);
} else if ("serviceWorker" in navigator) {
  // Remove a previously installed FCM worker from before Firebase was
  // configured — otherwise the stale worker keeps throwing on every load.
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs
      .filter((r) =>
        (r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '').includes('firebase-messaging-sw')
      )
      .forEach((r) => r.unregister().catch(() => {}));
  }).catch(() => {});
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

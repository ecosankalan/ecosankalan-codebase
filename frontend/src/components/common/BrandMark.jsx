import { useId } from 'react';

/**
 * BrandMark — clean vector EcoSankalan mark (sprout in a teal tile).
 * Replaces the old illustration PNG (busy bins scene on a black box)
 * everywhere in UI. Scales crisply at any size; theme-native colors.
 */
export default function BrandMark({ className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `brandmark-g-${uid}`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#55a630" />
          <stop offset="0.55" stopColor="#2A7C13" />
          <stop offset="1" stopColor="#1C5410" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17" fill={`url(#${gradId})`} />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="16" fill="none" stroke="#76C457" strokeOpacity="0.4" strokeWidth="1.5" />
      <path d="M32 47V30" stroke="#E7EFE2" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M32 37.5C24.8 37.5 19.3 32.8 18.3 24.6 26.3 25.6 31 30.2 32 37.5Z" fill="#76C457" />
      <path d="M32 32.5C39.2 32.5 44.7 27.8 45.7 19.6 37.7 20.6 33 25.2 32 32.5Z" fill="#E7EFE2" />
      <path d="M22 50.5Q32 54.5 42 50.5" stroke="#76C457" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

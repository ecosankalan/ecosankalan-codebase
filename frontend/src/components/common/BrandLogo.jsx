/**
 * BrandLogo — the single, canonical EcoSankalan lockup.
 * Use everywhere instead of raw <img src="/logo.png"> so the brand
 * always renders identically: gradient tile + wordmark + tagline.
 *
 * Props:
 *   size     xs | sm | md | lg   (default sm)
 *   onDark   bool — light wordmark for dark backgrounds (brand panel, footer, splash)
 *   tagline  string | undefined — small caps line under the wordmark
 *   iconOnly bool — tile without wordmark (splash, avatars, compact slots)
 */
import { useState } from 'react';
import '../../styles/brandlogo.css';
import BrandMark from './BrandMark';
export default function BrandLogo({
  size = 'sm',
  onDark = false,
  tagline,
  iconOnly = false,
}) {
  // Real product logo from public/logo.png, with SVG fallback if missing.
  const [imgOk, setImgOk] = useState(true);
  return (
    <span className={`brandlock brandlock--${size}${onDark ? ' brandlock--dark' : ''}${iconOnly ? ' brandlock--icon' : ''}`}>
      <span className={`brandlock-tile${imgOk ? '' : ' brandlock-tile--svg'}`} aria-hidden="true">
        {imgOk ? (
          <img
            src="/logo.png"
            alt=""
            className="brandlock-img brandlock-img--photo"
            onError={() => setImgOk(false)}
          />
        ) : (
          <BrandMark className="brandlock-img" />
        )}
        <span className="brandlock-shine" aria-hidden="true" />
      </span>
      {!iconOnly && (
        <span className="brandlock-text">
          <span className="brandlock-word">EcoSankalan</span>
          {tagline && <small className="brandlock-tag">{tagline}</small>}
        </span>
      )}
    </span>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/commandmenu.css';

/* ⌘K quick navigation — jump anywhere without leaving the keyboard */
const COMMAND_DEFS = [
  { key: 'dashboard',   icon: 'home',            route: '/dashboard',         keys: 'home dashboard main' },
  { key: 'scan',        icon: 'photo_camera',   route: '/waste',             keys: 'scan camera log ai waste' },
  { key: 'map',         icon: 'map',             route: '/community',        keys: 'map bins nearby community' },
  { key: 'impact',      icon: 'analytics',       route: '/impact',           keys: 'impact co2 analytics stats' },
  { key: 'challenges',  icon: 'emoji_events',   route: '/weekly-challenges', keys: 'challenges missions leaderboard' },
  { key: 'learn',       icon: 'school',          route: '/learn',            keys: 'learn courses quiz school' },
  { key: 'shop',        icon: 'shopping_cart',   route: '/shop',             keys: 'shop products rewards buy' },
  { key: 'vouchers',    icon: 'confirmation_number', route: '/vouchers',     keys: 'vouchers redeem coupons' },
  { key: 'history',     icon: 'history',         route: '/waste-history',    keys: 'history logs past' },
  { key: 'profile',     icon: 'person',          route: '/profile',          keys: 'profile account settings' },
];

export default function CommandMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const COMMANDS = useMemo(() => COMMAND_DEFS.map((c) => ({
    ...c,
    label: t(`cmdmenu.${c.key}`),
    hint: t(`cmdmenu.${c.key}Hint`),
  })), [t]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open ]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) =>
      `${c.label} ${c.hint} ${c.keys}`.toLowerCase().includes(q)
    );
  }, [query, COMMANDS]);

  useEffect(() => setCursor(0), [results.length]);

  const go = (route) => {
    setOpen(false);
    navigate(route);
  };

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      go(results[cursor].route);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!open) return null;

  return (
    <div className="cmd-backdrop" onClick={() => setOpen(false)} role="presentation">
      <div
        className="cmd-palette"
        role="dialog"
        aria-modal="true"
        aria-label={t('cmdmenu.dialogLabel')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cmd-input-row">
          <span className="material-symbols-outlined" aria-hidden="true">search</span>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder={t('cmdmenu.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            aria-label={t('cmdmenu.searchLabel')}
            aria-expanded="true"
            aria-controls="cmd-list"
            role="combobox"
            aria-autocomplete="list"
          />
          <kbd className="cmd-kbd">esc</kbd>
        </div>
        <ul className="cmd-list" id="cmd-list" role="listbox" ref={listRef}>
          {results.map((c, i) => (
            <li key={c.route}>
              <button
                type="button"
                role="option"
                aria-selected={i === cursor}
                data-index={i}
                className={`cmd-item${i === cursor ? ' active' : ''}`}
                onClick={() => go(c.route)}
                onMouseMove={() => setCursor(i)}
              >
                <span className="cmd-item-icon">
                  <span className="material-symbols-outlined" aria-hidden="true">{c.icon}</span>
                </span>
                <span className="cmd-item-text">
                  <strong>{c.label}</strong>
                  <small>{c.hint}</small>
                </span>
                <span className="material-symbols-outlined cmd-item-go" aria-hidden="true">arrow_forward</span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="cmd-empty">{t('cmdmenu.empty')}</li>
          )}
        </ul>
        <div className="cmd-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> {t('cmdmenu.navigate')}</span>
          <span><kbd>↵</kbd> {t('cmdmenu.open')}</span>
          <span><kbd>ctrl K</kbd> {t('cmdmenu.toggle')}</span>
        </div>
      </div>
    </div>
  );
}

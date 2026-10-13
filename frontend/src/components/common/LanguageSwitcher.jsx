import { useTranslation } from 'react-i18next';
import '../../styles/language-switcher.css';

export default function LanguageSwitcher({ compact = false }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.language || 'en').split('-')[0];

  const setLang = (lng) => {
    if (lng !== current) i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`lang-switch${compact ? ' lang-switch--compact' : ''}`}
      role="group"
      aria-label={t('lang.label')}
    >
      <button
        type="button"
        className={`lang-switch-btn${current === 'en' ? ' active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
      <span className="lang-switch-sep" aria-hidden="true">|</span>
      <button
        type="button"
        className={`lang-switch-btn${current === 'hi' ? ' active' : ''}`}
        onClick={() => setLang('hi')}
        aria-pressed={current === 'hi'}
      >
        हिं
      </button>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center" role="main" aria-label={t('misc.notFoundAria')}>
      <p className="text-sm font-semibold text-green-700" aria-hidden="true">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">{t('misc.notFoundTitle')}</h1>
      <p className="mt-2 text-gray-600">{t('misc.notFoundSub')}</p>
      <Link to="/" className="mt-6 rounded-lg bg-green-700 px-5 py-2.5 text-white font-semibold hover:bg-green-800" aria-label={t('misc.notFoundCtaAria')}>
        {t('misc.notFoundCta')}
      </Link>
    </main>
  );
}

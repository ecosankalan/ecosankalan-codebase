import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';

export default function PrivacyPolicyPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl pt-24">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('misc.privacyTitle')}</h1>
          <p className="text-sm text-gray-500 mb-8">{t('misc.privacyUpdated', { date: new Date().toLocaleDateString(locale) })}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('misc.privacyS1T')}</h2>
            <p className="text-gray-600 mb-4">
              {t('misc.privacyS1D')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('misc.privacyS2T')}</h2>
            <p className="text-gray-600 mb-4">
              {t('misc.privacyS2D')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t('misc.privacyS2L1')}</li>
              <li>{t('misc.privacyS2L2')}</li>
              <li>{t('misc.privacyS2L3')}</li>
              <li>{t('misc.privacyS2L4')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('misc.privacyS3T')}</h2>
            <p className="text-gray-600 mb-4">
              {t('misc.privacyS3D')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t('misc.privacyS3L1')}</li>
              <li>{t('misc.privacyS3L2')}</li>
              <li>{t('misc.privacyS3L3')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('misc.privacyS4T')}</h2>
            <p className="text-gray-600 mb-4">
              {t('misc.privacyS4D')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('misc.privacyS5T')}</h2>
            <p className="text-gray-600 mb-4">
              {t('misc.privacyS5D')}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

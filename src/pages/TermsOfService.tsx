import React, { lazy, Suspense } from 'react';
import { useLanguage } from '../i18n';

const TermsOfServiceEN = lazy(() => import('./TermsOfServiceEN'));
const TermsOfServiceTR = lazy(() => import('./TermsOfServiceTR'));

const TermsOfService: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-cyan-500 font-mono animate-pulse">Loading...</div>}>
      {language === 'tr' ? <TermsOfServiceTR /> : <TermsOfServiceEN />}
    </Suspense>
  );
};

export default TermsOfService;
import React, { lazy, Suspense } from 'react';
import { useLanguage } from '../i18n';

const PrivacyPolicyEN = lazy(() => import('./PrivacyPolicyEN'));
const PrivacyPolicyTR = lazy(() => import('./PrivacyPolicyTR'));

const PrivacyPolicy: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-cyan-500 font-mono animate-pulse">Loading...</div>}>
      {language === 'tr' ? <PrivacyPolicyTR /> : <PrivacyPolicyEN />}
    </Suspense>
  );
};

export default PrivacyPolicy;
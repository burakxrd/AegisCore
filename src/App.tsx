import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider, SUPPORTED_LANGUAGES, detectBrowserLanguage, type Language } from './i18n';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AegisIntelligence = lazy(() => import('./pages/AegisIntelligence'));
const ToolsCatalog = lazy(() => import('./pages/ToolsCatalog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogList = lazy(() => import('./pages/BlogList'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

const IpIntelligence = lazy(() => import('./tools/IpIntelligence'));
const DomainAnalyzer = lazy(() => import('./tools/DomainAnalyzer'));
const Base64 = lazy(() => import('./tools/Base64'));
const HashGenerator = lazy(() => import('./tools/HashGenerator'));
const CTFWorkspace = lazy(() => import('./pages/CTFWorkspace'));


// ─── Language Redirect ────────────────────────────────────────────
// Redirects bare paths (/, /tools/..., etc.) to /:detectedLang/...
function LanguageRedirect() {
  const location = useLocation();
  const detectedLang = detectBrowserLanguage();
  const targetPath = `/${detectedLang}${location.pathname === '/' ? '' : location.pathname}${location.search}`;
  return <Navigate to={targetPath} replace />;
}

// ─── Language Guard ───────────────────────────────────────────────
// Validates the :lang param. If invalid, redirects to detected language.
function LangGuard() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();

  if (!lang || !SUPPORTED_LANGUAGES.includes(lang as Language)) {
    const detectedLang = detectBrowserLanguage();
    const restOfPath = location.pathname.replace(`/${lang}`, '') || '/';
    return <Navigate to={`/${detectedLang}${restOfPath}${location.search}`} replace />;
  }

  return (
    <LanguageProvider>
      <AppLayout />
    </LanguageProvider>
  );
}

// ─── App Layout ───────────────────────────────────────────────────
function AppLayout() {
  const location = useLocation();
  // Strip /:lang prefix for page logic
  const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}/, '');
  const isFullscreenPage = pathWithoutLang === '/ai' || pathWithoutLang === '/tools/ctf-workspace';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-x-hidden ${isFullscreenPage ? 'overflow-hidden h-screen' : ''}`}>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <Header />

      <main className={`relative z-10 flex-1 w-full ${isFullscreenPage ? 'max-w-full' : 'max-w-7xl'} mx-auto ${isFullscreenPage ? 'p-0 flex flex-col overflow-hidden' : 'p-4 sm:p-6 md:p-10'}`}>
        <div key={location.pathname} className="animate-page-in flex-1 flex flex-col min-h-0">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-cyan-500 font-mono"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="ai" element={<AegisIntelligence />} />
              <Route path="tools" element={<ToolsCatalog />} />
              <Route path="blog" element={<BlogList />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-of-service" element={<TermsOfService />} />

              <Route path="tools/ip-intelligence" element={<IpIntelligence />} />
              <Route path="tools/domain-analyzer" element={<DomainAnalyzer />} />
              <Route path="tools/hash-generator" element={<HashGenerator />} />
              <Route path="tools/base64-codec" element={<Base64 />} />
              <Route path="tools/ctf-workspace" element={<CTFWorkspace />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Root → redirect to detected language */}
          <Route path="/" element={<LanguageRedirect />} />

          {/* Language-prefixed routes */}
          <Route path="/:lang/*" element={<LangGuard />} />

          {/* Catch-all for old non-prefixed URLs */}
          <Route path="*" element={<LanguageRedirect />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
import React from 'react';
import { FileText, Mail } from 'lucide-react';

const TermsOfServiceEN: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md p-10">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-5">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0 mt-1">
            <FileText className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Terms of <span className="text-cyan-500">Service</span></h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Effective Date: March 18, 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        <div className="prose max-w-none">

          <p>
            Welcome to <strong>Aegis Core</strong> (aegis.net.tr). By accessing or using our website, tools, and
            intelligence reports, you agree to be bound by these Terms of Service. If you disagree with any part of
            these terms, you must not use our services.
          </p>

          <h2>1. Educational and Defensive Purpose Only</h2>
          <p>
            This is the most critical rule of Aegis Core. All tools (including IP Intelligence, Domain Analyzer, Hash
            Generator, and Base64 Codec) and all written intelligence reports are provided{' '}
            <strong>strictly for educational, defensive, and authorized testing purposes only.</strong>
          </p>
          <ul>
            <li>
              You may only use these tools on networks, domains, and systems that you own or have explicit, written
              authorization to test.
            </li>
            <li>
              Any malicious use, illegal hacking, or utilization of our tools to facilitate unauthorized access is
              strictly prohibited.
            </li>
            <li>Aegis Core holds zero liability for any misuse of the provided tools or information.</li>
          </ul>

          <h2>2. "As-Is" Service and No Warranties</h2>
          <p>
            Our cybersecurity toolkits are provided on an "as-is" and "as-available" basis. While we strive for extreme
            accuracy in our OSINT and cryptographic tools, we make no warranties, expressed or implied, regarding the
            completeness, accuracy, reliability, or availability of the tools. Your use of the terminal and its outputs
            is entirely at your own risk.
          </p>

          <h2>3. Local Processing and Data Integrity</h2>
          <p>
            As stated in our Privacy Policy, cryptographic operations (Hash, Base64) are processed locally within your
            browser environment. You are entirely responsible for the strings and files you input into our offline
            terminal. Aegis Core cannot recover, monitor, or verify the data you process.
          </p>

          <h2>4. User Conduct and Abuse</h2>
          <p>When using Aegis Core infrastructure, you agree not to:</p>
          <ul>
            <li>
              Deploy automated scripts, bots, or scrapers that cause excessive load on our Nginx servers or Cloudflare
              endpoints.
            </li>
            <li>
              Attempt to exploit, reverse-engineer, or disrupt the functionality of the Aegis Core application itself.
            </li>
            <li>Use our site to distribute malware, phishing links, or malicious payloads.</li>
          </ul>

          <h2>5. Third-Party Content</h2>
          <p>
            Our platform may contain links to third-party web sites or services (including AdSense advertisements) that
            are not owned or controlled by Aegis. We assume no responsibility for the content, privacy policies, or
            practices of any third-party websites or services.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will notify
            users of significant changes by updating the "Effective Date" at the top of this document.
          </p>

          <h2>7. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact our administrative channel:</p>
        </div>

        {/* Contact card */}
        <div className="mt-6 flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl px-6 py-4">
          <Mail className="w-5 h-5 text-cyan-500 shrink-0" />
          <span className="text-slate-400 font-mono text-sm">
            <a href="mailto:info@aegis.net.tr" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              info@aegis.net.tr
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceEN;

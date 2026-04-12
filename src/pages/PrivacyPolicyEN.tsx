import React from 'react';
import { Shield, Mail } from 'lucide-react';

const PrivacyPolicyEN: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md p-10">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-5">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0 mt-1">
            <Shield className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Privacy <span className="text-cyan-500">Policy</span></h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Effective Date: March 18, 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        <div className="prose max-w-none">

          <p>
            Welcome to <strong>Aegis</strong> (aegis.net.tr). We respect your privacy and are committed to protecting it.
            This Privacy Policy explains how we handle data when you visit our website and use our security protocol toolkits.
          </p>

          <h2>1. Zero Data Collection on Cryptographic Tools</h2>
          <p>Our core philosophy is absolute privacy. When you use our tools (such as the Hash Generator or Base64 Codec):</p>
          <ul>
            <li><strong>Terminal operates in offline mode.</strong></li>
            <li><strong>Cryptographic operations are performed locally via the Web Crypto API.</strong></li>
            <li><strong>Zero data leaves your machine.</strong></li>
          </ul>
          <p>
            We do not transmit, log, store, or monitor any input data, strings, or files you process through our
            client-side tools. Everything happens exclusively within your local browser environment.
          </p>

          <h2>2. Information We Collect Automatically</h2>
          <p>
            While we do not collect personal information like names or user accounts (as we have no registration system),
            our infrastructure automatically collects basic, non-identifiable data to keep the site secure and functional:
          </p>
          <ul>
            <li>
              <strong>Server Logs:</strong> Like most standard websites, our Nginx servers temporarily log basic request
              data (e.g., anonymized IP addresses, browser types, timestamps) strictly for security monitoring,
              preventing DDoS attacks, and ensuring server stability.
            </li>
            <li>
              <strong>Cloudflare:</strong> We use Cloudflare for DNS routing and security. Cloudflare may process
              network data to filter out malicious traffic before it reaches our servers.
            </li>
          </ul>

          <h2>3. Analytics and Tracking</h2>
          <p>We use multiple analytics services to understand our website traffic and improve user experience:</p>
          <ul>
            <li>
              <strong>Cloudflare Web Analytics:</strong> A privacy-first analytics tool that does not use client-side
              state (such as cookies) to collect usage metrics.
            </li>
            <li>
              <strong>Google Analytics:</strong> We use Google Analytics to measure website traffic. Google Analytics
              uses cookies to collect anonymous data about your interactions with our site. You can learn more by
              visiting{' '}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
                Google's Privacy &amp; Terms
              </a>
              . You can opt-out via the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </li>
          </ul>

          <h2>4. Advertising and Google AdSense</h2>
          <p>
            To keep our tools free and maintain our servers, we use <strong>Google AdSense</strong> to serve ads when
            you visit our website.
          </p>
          <ul>
            <li>Google, as a third-party vendor, uses cookies to serve ads on this site.</li>
            <li>
              Google's use of the <strong>DART cookie</strong> enables it to serve ads based on previous visits to our
              site and other sites on the Internet.
            </li>
            <li>
              Users may opt-out by visiting the{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
                Google Ad and Content Network privacy policy
              </a>
              .
            </li>
          </ul>
          <p>
            These third-party ad servers use technologies like cookies, JavaScript, or Web Beacons in their
            advertisements. They automatically receive your IP address when this occurs. Aegis has no access to or
            control over these cookies used by third-party advertisers.
          </p>

          <h2>5. Third-Party Links</h2>
          <p>
            Our website or intelligence reports may contain links to external sites that are not operated by us. We have
            no control over the content and practices of these sites and cannot accept responsibility for their
            respective privacy policies.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time as we add new tools or features. We will notify you of
            any changes by posting the new Privacy Policy on this page.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or our data handling practices, please
            contact us:
          </p>
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

export default PrivacyPolicyEN;

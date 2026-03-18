import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen p-8 text-gray-300 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="mb-4 text-sm text-gray-400"><strong>Effective Date:</strong> March 18, 2026</p>
        
        <p className="mb-6">Welcome to <strong>Aegis</strong> (aegis.net.tr). We respect your privacy and are committed to protecting it. This Privacy Policy explains how we handle data when you visit our website and use our security protocol toolkits.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Zero Data Collection on Cryptographic Tools</h2>
        <p className="mb-2">Our core philosophy is absolute privacy. When you use our tools (such as the Hash Generator or Base64 Codec):</p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li><strong>Terminal operates in offline mode.</strong></li>
          <li><strong>Cryptographic operations are performed locally via the Web Crypto API.</strong></li>
          <li><strong>Zero data leaves your machine.</strong></li>
        </ul>
        <p className="mb-6">We do not transmit, log, store, or monitor any input data, strings, or files you process through our client-side tools. Everything happens exclusively within your local browser environment.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Information We Collect Automatically</h2>
        <p className="mb-4">While we do not collect personal information like names or user accounts (as we have no registration system), our infrastructure automatically collects basic, non-identifiable data to keep the site secure and functional:</p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li><strong>Server Logs:</strong> Like most standard websites, our Nginx servers temporarily log basic request data (e.g., anonymized IP addresses, browser types, timestamps) strictly for security monitoring, preventing DDoS attacks, and ensuring server stability.</li>
          <li><strong>Cloudflare:</strong> We use Cloudflare for DNS routing and security. Cloudflare may process network data to filter out malicious traffic before it reaches our servers.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Analytics and Tracking</h2>
                <p className="mb-4">We use multiple analytics services to understand our website traffic and improve user experience:</p>
                <ul className="list-disc pl-6 mb-6 space-y-1">
                  <li><strong>Cloudflare Web Analytics:</strong> A privacy-first analytics tool that does not use client-side state (such as cookies) to collect usage metrics.</li>
                  <li><strong>Google Analytics:</strong> We use Google Analytics to measure website traffic. Google Analytics uses cookies to collect anonymous data about your interactions with our site. You can learn more about how Google uses data when you use our site by visiting <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Google's Privacy & Terms</a>. You can also opt-out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Google Analytics Opt-out Browser Add-on</a>.</li>
                </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Advertising and Google AdSense</h2>
        <p className="mb-2">To keep our tools free and maintain our servers, we use third-party advertising companies, specifically <strong>Google AdSense</strong>, to serve ads when you visit our website.</p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>Google, as a third-party vendor, uses cookies to serve ads on this site.</li>
          <li>Google's use of the <strong>DART cookie</strong> enables it to serve ads to our users based on previous visits to our site and other sites on the Internet.</li>
          <li>Users may opt-out of the use of the DART cookie by visiting the <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Google Ad and Content Network privacy policy</a>.</li>
        </ul>
        <p className="mb-6">These third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons in their respective advertisements and links that appear on Aegis, which are sent directly to your browser. They automatically receive your IP address when this occurs. Aegis has no access to or control over these cookies used by third-party advertisers.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Third-Party Links</h2>
        <p className="mb-6">Our website or intelligence reports may contain links to external sites (for educational or reference purposes) that are not operated by us. We have no control over the content and practices of these sites and cannot accept responsibility for their respective privacy policies.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Changes to This Policy</h2>
        <p className="mb-6">We may update our Privacy Policy from time to time as we add new tools or features. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Contact Us</h2>
        <p className="mb-6">If you have any questions or concerns about this Privacy Policy or our data handling practices, please contact us at:<br/>
        <strong>Email:</strong> <a href="mailto:info@aegis.net.tr" className="text-blue-400 hover:underline">info@aegis.net.tr</a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen p-8 text-gray-300 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="mb-4 text-sm text-gray-400"><strong>Effective Date:</strong> March 18, 2026</p>
        
        <p className="mb-6">Welcome to <strong>Aegis Core</strong> (aegis.net.tr). By accessing or using our website, tools, and intelligence reports, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must not use our services.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Educational and Defensive Purpose Only</h2>
        <p className="mb-4">This is the most critical rule of Aegis Core. All tools (including IP Intelligence, Domain Analyzer, Hash Generator, and Base64 Codec) and all written intelligence reports are provided <strong>strictly for educational, defensive, and authorized testing purposes only.</strong></p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>You may only use these tools on networks, domains, and systems that you own or have explicit, written authorization to test.</li>
          <li>Any malicious use, illegal hacking, or utilization of our tools to facilitate unauthorized access is strictly prohibited.</li>
          <li>Aegis Core holds zero liability for any misuse of the provided tools or information.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. "As-Is" Service and No Warranties</h2>
        <p className="mb-6">Our cybersecurity toolkits are provided on an "as-is" and "as-available" basis. While we strive for extreme accuracy in our OSINT (Open Source Intelligence) and cryptographic tools, we make no warranties, expressed or implied, regarding the completeness, accuracy, reliability, or availability of the tools. Your use of the terminal and its outputs is entirely at your own risk.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Local Processing and Data Integrity</h2>
        <p className="mb-6">As stated in our Privacy Policy, cryptographic operations (Hash, Base64) are processed locally within your browser environment. You are entirely responsible for the strings and files you input into our offline terminal. Aegis Core cannot recover, monitor, or verify the data you process.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. User Conduct and Abuse</h2>
        <p className="mb-2">When using Aegis Core infrastructure, you agree not to:</p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>Deploy automated scripts, bots, or scrapers that cause excessive load on our Nginx servers or Cloudflare endpoints.</li>
          <li>Attempt to exploit, reverse-engineer, or disrupt the functionality of the Aegis Core application itself.</li>
          <li>Use our site to distribute malware, phishing links, or malicious payloads.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Third-Party Content</h2>
        <p className="mb-6">Our platform may contain links to third-party web sites or services (including AdSense advertisements) that are not owned or controlled by Aegis. We assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Changes to Terms</h2>
        <p className="mb-6">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will notify users of significant changes by updating the "Effective Date" at the top of this document.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Contact Information</h2>
        <p className="mb-6">If you have any questions about these Terms, please contact our administrative channel at:<br/>
        <strong>Email:</strong> <a href="mailto:info@aegis.net.tr" className="text-cyan-400 hover:underline">info@aegis.net.tr</a></p>
      </div>
    </div>
  );
};

export default TermsOfService;
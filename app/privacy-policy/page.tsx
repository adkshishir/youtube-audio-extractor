import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy - YouTube Audio Extractor',
  description: 'Read our privacy policy to understand how we collect, use, and protect your data when using YouTube Audio Extractor.',
  openGraph: {
    title: 'Privacy Policy - YouTube Audio Extractor',
    description: 'Read our privacy policy to understand how we collect, use, and protect your data when using YouTube Audio Extractor.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - YouTube Audio Extractor",
    "description": "Read our privacy policy to understand how we collect, use, and protect your data when using YouTube Audio Extractor.",
    "publisher": {
      "@type": "Organization",
      "name": "YouTube Audio Extractor",
      "url": "https://youtube-audio-extractor.com"
    }
  };

  return (
    <>
    
      <main className="container mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-lg mb-4">
              At YouTube Audio Extractor, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-lg mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>YouTube video URLs that you submit for processing</li>
              <li>Basic usage statistics to improve our service</li>
              <li>Technical information about your device and browser</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-lg mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Process your audio extraction requests</li>
              <li>Improve our service and user experience</li>
              <li>Maintain and optimize our website</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
            <p className="text-lg mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Secure data transmission using SSL/TLS</li>
              <li>Regular security assessments</li>
              <li>Limited access to personal information</li>
              <li>Regular data backups</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-lg mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access your personal information</li>
              <li>Request correction of your data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of non-essential data collection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-lg mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@youtube-audio-extractor.com
            </p>
          </section>
        </div>
      </main>
    </>
  );
} 
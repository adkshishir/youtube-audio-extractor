import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'About Us - YouTube Audio Extractor',
  description: 'Learn about YouTube Audio Extractor, our mission, and how we help users extract audio from YouTube videos.',
  openGraph: {
    title: 'About Us - YouTube Audio Extractor',
    description: 'Learn about YouTube Audio Extractor, our mission, and how we help users extract audio from YouTube videos.',
    type: 'website',
  },
};

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About YouTube Audio Extractor",
    "description": "Learn about YouTube Audio Extractor, our mission, and how we help users extract audio from YouTube videos.",
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
        
        <h1 className="text-4xl font-bold mb-8">About YouTube Audio Extractor</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg mb-4">
              YouTube Audio Extractor is dedicated to providing a simple, efficient, and user-friendly solution for extracting audio from YouTube videos. We believe in making audio content more accessible while respecting copyright and fair use policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="text-lg mb-4">
              Our platform allows users to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Extract audio from YouTube videos in various formats</li>
              <li>Download high-quality audio files</li>
              <li>Convert videos to different audio formats</li>
              <li>Access audio content for personal use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
            <p className="text-lg mb-4">
              We are committed to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Providing a secure and reliable service</li>
              <li>Respecting user privacy and data protection</li>
              <li>Maintaining high-quality audio extraction</li>
              <li>Supporting fair use of content</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
} 
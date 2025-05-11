import { Metadata } from 'next';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  createdAt: string;
  author: {
    name: string;
  };
}

export const metadata: Metadata = {
  title: 'Blog - YouTube Audio Extractor',
  description: 'Read our latest articles about audio extraction, YouTube tips, and best practices for using YouTube Audio Extractor.',
  openGraph: {
    title: 'Blog - YouTube Audio Extractor',
    description: 'Read our latest articles about audio extraction, YouTube tips, and best practices for using YouTube Audio Extractor.',
    type: 'website',
  },
};

async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`, {
    next: {
      revalidate: 3600 // Revalidate every hour
    }
  });
   
  if (!response.ok) {
    // throw new Error('Failed to fetch blog posts');
    return [];
  }

  return response.json();
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "YouTube Audio Extractor Blog",
    "description": "Read our latest articles about audio extraction, YouTube tips, and best practices for using YouTube Audio Extractor.",
    "publisher": {
      "@type": "Organization",
      "name": "YouTube Audio Extractor",
      "url": "https://youtube-audio-extractor.com"
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <div className="grid gap-8">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {post.coverImage && (
              <div className="aspect-video relative">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              
              <div className="text-gray-600 mb-4">
                Published on {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} by {post.author.name}
              </div>
              
              <p className="text-lg mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-primary hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
} 
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getBlogPost(slug: string): Promise<BlogPost> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`, {
    next: {
      revalidate: 3600 // Revalidate every hour
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch blog post');
  }

  return response.json();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await getBlogPost(params.slug);
    
    return {
      title: `${post.title} - YouTube Audio Extractor`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.createdAt,
        authors: [post.author.name],
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage,
    "datePublished": post.createdAt,
    "dateModified": post.createdAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
    },
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
      
      <article className="max-w-3xl mx-auto">
        {post.coverImage && (
          <div className="aspect-video relative mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">
          {post.title}
        </h1>
        
        <div className="text-gray-600 mb-8">
          Published on {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} by {post.author.name}
        </div>
        
        <p className="text-lg mb-4">
          {post.excerpt}
        </p>
        
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
} 
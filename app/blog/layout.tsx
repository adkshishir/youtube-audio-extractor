import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Blog - YouTube Media Extractor",
  description: "Learn about YouTube video downloading, audio extraction, and media conversion. Tips, tutorials, and guides.",
  keywords: "YouTube blog, video downloading guide, audio extraction tutorial, media conversion tips",
  openGraph: {
    title: "Blog - YouTube Media Extractor",
    description: "Learn about YouTube video downloading, audio extraction, and media conversion. Tips, tutorials, and guides.",
    type: "website",
    locale: "en_US",
    siteName: "YouTube Media Extractor Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - YouTube Media Extractor",
    description: "Learn about YouTube video downloading, audio extraction, and media conversion. Tips, tutorials, and guides.",
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Learn about YouTube video downloading, audio extraction, and media conversion. Tips, tutorials, and guides.
          </p>
        </header>
        {children}
      </div>
    </div>
  )
} 
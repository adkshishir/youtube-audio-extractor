import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { BlogCard } from "@/components/blog-card"
import { Pagination } from "@/components/pagination"

export const metadata: Metadata = {
  title: "Blog | YouTube Audio Extractor",
  description: "Read our latest articles about YouTube audio extraction, video downloading, and more.",
}

interface BlogPageProps {
  searchParams: {
    page?: string
    category?: string
    tag?: string
  }
}

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  createdAt: Date
  author: {
    name: string
    image: string | null
  }
  categories: {
    name: string
    slug: string
  }[]
  tags: {
    name: string
    slug: string
  }[]
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = Number(searchParams.page) || 1
  const pageSize = 9
  const skip = (page - 1) * pageSize

  const where = {
    published: true,
    ...(searchParams.category && {
      categories: {
        some: {
          slug: searchParams.category,
        },
      },
    }),
    ...(searchParams.tag && {
      tags: {
        some: {
          slug: searchParams.tag,
        },
      },
    }),
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.blog.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog: Blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/blog"
      />
    </div>
  )
} 
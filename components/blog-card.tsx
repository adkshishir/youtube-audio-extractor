import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

interface BlogCardProps {
  blog: {
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
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        {blog.coverImage && (
          <div className="aspect-video relative">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {blog.categories.map((category) => (
              <Badge key={category.slug} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
          <h2 className="text-xl font-semibold line-clamp-2">{blog.title}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">{blog.excerpt}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {blog.author.image && (
              <Image
                src={blog.author.image}
                alt={blog.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-muted-foreground">{blog.author.name}</span>
          </div>
          <time className="text-sm text-muted-foreground">
            {formatDate(blog.createdAt)}
          </time>
        </CardFooter>
      </Card>
    </Link>
  )
} 
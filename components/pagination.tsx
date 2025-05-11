import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const maxVisiblePages = 5
  const halfVisible = Math.floor(maxVisiblePages / 2)

  let visiblePages = pages
  if (totalPages > maxVisiblePages) {
    const start = Math.max(currentPage - halfVisible, 1)
    const end = Math.min(start + maxVisiblePages - 1, totalPages)
    visiblePages = pages.slice(start - 1, end)
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage === 1}
      >
        <Link href={`${baseUrl}?page=${currentPage - 1}`}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          asChild
        >
          <Link href={`${baseUrl}?page=${page}`}>{page}</Link>
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage === totalPages}
      >
        <Link href={`${baseUrl}?page=${currentPage + 1}`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  )
} 
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const blog = await prisma.blog.findUnique({
      where: {
        id: params.id,
      },
      include: {
        seo: true,
      },
    })

    if (!blog) {
      return new NextResponse('Blog not found', { status: 404 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
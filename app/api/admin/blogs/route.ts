import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(blogs)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content, excerpt, coverImage, published, seo } = body

    // First, get or create the user record
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { username: true }
    })

    if (!admin) {
      return new NextResponse('Admin not found', { status: 404 })
    }

    // Create or get the user record
    const user = await prisma.user.upsert({
      where: { email: admin.username },
      update: {},
      create: {
        email: admin.username,
        name: admin.username,
        role: 'ADMIN'
      }
    })

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
        authorId: user.id,
        seo: {
          create: {
            title: seo.title,
            description: seo.description,
            keywords: seo.keywords,
            ogImage: seo.ogImage,
          },
        },
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error creating blog:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { id, title, slug, content, excerpt, coverImage, published, seo } = body

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
        seo: {
          update: {
            title: seo.title,
            description: seo.description,
            keywords: seo.keywords,
            ogImage: seo.ogImage,
          },
        },
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error updating blog:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
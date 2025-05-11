import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { unlink } from 'fs/promises'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const previousImage = formData.get('previousImage') as string

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${uniqueSuffix}-${file.name}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)

    // Delete previous image if it exists
    if (previousImage) {
      const previousPath = join(process.cwd(), 'public', previousImage)
      try {
        await unlink(previousPath)
      } catch (error) {
        console.error('Error deleting previous image:', error)
      }
    }

    // Save new image
    await writeFile(filepath, buffer)
    const imageUrl = `/uploads/${filename}`

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error('Error uploading file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Ensure params.path is available
    if (!params?.path) {
      return new NextResponse('File path not provided', { status: 400 })
    }

    // Get the file path from params
    const filePath = path.join(process.cwd(), 'downloads', ...params.path)

    // Check if file exists using async operation
    try {
      await fs.access(filePath)
    } catch (error) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read the file asynchronously
    const fileBuffer = await fs.readFile(filePath)
    const fileName = params.path[params.path.length - 1]

    // Determine content type
    const contentType = fileName.endsWith('.mp3') 
      ? 'audio/mpeg' 
      : fileName.endsWith('.mp4') 
        ? 'video/mp4' 
        : 'application/octet-stream'

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
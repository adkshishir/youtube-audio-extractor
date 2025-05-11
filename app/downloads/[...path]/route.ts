import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the file path from params
    const filePath = path.join(process.cwd(), 'downloads', ...params.path)

    // Check if file exists using async operation
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error('File not found:', filePath)
      return new NextResponse('File not found', { status: 404 })
    }

    // Read the file asynchronously
    const fileBuffer = await fs.readFile(filePath)
    const fileName = params.path[params.path.length - 1]

    // Determine content type
    const contentType = fileName.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4'

    // Create headers
    const headers = new Headers({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
    })

    // Return the file as a stream
    return new NextResponse(fileBuffer, { headers })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Error serving file: ' + (error instanceof Error ? error.message : 'Unknown error'), { 
      status: 500 
    })
  }
} 
import { NextResponse } from 'next/server'
import ytdl from 'ytdl-core'
import { Readable } from 'stream'
import { cleanupDownloads } from '@/lib/youtube'

export async function GET(
  request: Request,
  { params }: { params: { format: string; id: string; filename: string } }
) {
  try {
    const { format, id, filename } = params

    // Clean up old files before downloading new ones
    cleanupDownloads()

    const videoUrl = `https://www.youtube.com/watch?v=${id}`

    let options: ytdl.downloadOptions = {
      quality: 'highest',
    }

    if (format === 'mp3') {
      options = {
        quality: 'highestaudio',
        filter: 'audioonly',
      }
    } else if (format === 'mp4') {
      options = {
        quality: 'highest',
        filter: 'audioandvideo',
      }
    }

    const videoStream = ytdl(videoUrl, options)

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4')
    headers.set('Content-Disposition', `attachment; filename="${params.filename}"`)

    // Convert stream to response
    const stream = new ReadableStream({
      start(controller) {
        videoStream.on('data', (chunk) => {
          controller.enqueue(chunk)
        })
        videoStream.on('end', () => {
          controller.close()
        })
        videoStream.on('error', (error) => {
          controller.error(error)
        })
      },
    })

    return new Response(stream, { headers })
  } catch (error) {
    console.error('Error downloading video:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
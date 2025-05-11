import { NextResponse } from 'next/server'
import ytdl from 'ytdl-core'
import { Readable } from 'stream'
import { cleanupDownloads } from '@/app/actions/cleanup'

// Cache for video info to avoid repeated requests
const videoInfoCache = new Map<string, any>()

// Configure ytdl-core options
const YTDL_OPTIONS = {
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  },
}

export async function GET(
  request: Request,
  { params }: { params: { format: string; id: string; filename: string } }
) {
  try {
    const { format, id, filename } = params

    // Clean up old files before downloading new ones
    await cleanupDownloads()

    const videoUrl = `https://www.youtube.com/watch?v=${id}`

    // Get video info with caching and retry mechanism
    let videoInfo = videoInfoCache.get(id)
    if (!videoInfo) {
      try {
        videoInfo = await ytdl.getInfo(videoUrl, YTDL_OPTIONS)
        videoInfoCache.set(id, videoInfo)
      } catch (error) {
        console.error('Error getting video info:', error)
        // Clear cache on error
        videoInfoCache.delete(id)
        throw new Error('Failed to get video information')
      }
    }

    let options: ytdl.downloadOptions = {
      ...YTDL_OPTIONS,
      quality: format,
    }

    // Enhanced format handling with better quality selection
    if (format === 'mp3') {
      options = {
        ...YTDL_OPTIONS,
        quality: 'highestaudio',
        filter: 'audioonly',
      }
    } else if (format.includes('mov')) {
      options = {
        ...YTDL_OPTIONS,
        quality: format.replace('mov', ''),
        filter: 'videoandaudio',
      }
    } else if (format.includes('mp4')) {
      const quality = format.replace('mp4', '')
      options = {
        ...YTDL_OPTIONS,
        quality: quality || 'highest',
        filter: 'videoandaudio',
      }
    }

    // Set up progress tracking
    let downloadedBytes = 0
    const videoStream = ytdl(videoUrl, options)

    // Handle stream errors
    videoStream.on('error', (error) => {
      console.error('Stream error:', error)
      videoInfoCache.delete(id)
    })

    // Set appropriate headers based on format
    const headers = new Headers()
    const contentType = format === 'mp3' 
      ? 'audio/mpeg' 
      : format.includes('mov') 
        ? 'video/quicktime' 
        : 'video/mp4'
    
    headers.set('Content-Type', contentType)
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    // Convert stream to response with progress tracking
    const stream = new ReadableStream({
      start(controller) {
        videoStream.on('data', (chunk) => {
          downloadedBytes += chunk.length
          controller.enqueue(chunk)
        })
        videoStream.on('end', () => {
          controller.close()
          // Clear cache after successful download
          videoInfoCache.delete(id)
        })
        videoStream.on('error', (error) => {
          controller.error(error)
          // Clear cache on error
          videoInfoCache.delete(id)
        })
      },
    })

    return new Response(stream, { headers })
  } catch (error) {
    console.error('Error downloading video:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error', 
      { status: 500 }
    )
  }
} 
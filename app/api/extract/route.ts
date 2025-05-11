import { NextResponse } from 'next/server'
import ytdl from 'ytdl-core'
import { getVideoInfo } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return new NextResponse('URL is required', { status: 400 })
    }

    const videoInfo = await getVideoInfo(url)
    if (!videoInfo) {
      return new NextResponse('Failed to fetch video info', { status: 400 })
    }

    // Get available formats
    const formats = videoInfo.formats.filter(format => 
      format.hasAudio && format.hasVideo && 
      (format.container === 'mp4' || format.container === 'mov')
    ).map(format => ({
      itag: format.itag,
      quality: format.quality,
      container: format.container,
      hasAudio: format.hasAudio,
      hasVideo: format.hasVideo,
      contentLength: format.contentLength,
      mimeType: format.mimeType,
    }))

    // Get audio-only format
    const audioFormat = videoInfo.formats.find(format => 
      format.hasAudio && !format.hasVideo && format.container === 'mp4'
    )

    return NextResponse.json({
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: videoInfo.duration,
      formats,
      audioFormat: audioFormat ? {
        itag: audioFormat.itag,
        container: audioFormat.container,
        mimeType: audioFormat.mimeType,
        contentLength: audioFormat.contentLength,
      } : null,
    })
  } catch (error) {
    console.error('Error extracting video:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

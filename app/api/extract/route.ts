import { NextResponse } from 'next/server'
import ytdl from 'ytdl-core'
import { getVideoInfo } from '@/lib/youtube'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return new NextResponse('URL is required', { status: 400 })
    }

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return new NextResponse('Invalid YouTube URL', { status: 400 })
    }

    console.log('Starting video extraction for URL:', url)
    
    let lastError: Error | null = null
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${MAX_RETRIES}`)
        const videoInfo = await getVideoInfo(url)
        
        if (!videoInfo) {
          throw new Error('No video info returned')
        }

        console.log('Successfully extracted video info:', {
          id: videoInfo.id,
          title: videoInfo.title,
          duration: videoInfo.duration,
          formats: videoInfo.formats.length,
          hasAudio: !!videoInfo.audioFormat
        })

        return NextResponse.json(videoInfo)
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`)
          await delay(RETRY_DELAY)
        }
      }
    }

    // If we get here, all retries failed
    console.error('All extraction attempts failed:', lastError)
    return new NextResponse(
      lastError?.message || 'Failed to extract video info after multiple attempts',
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in extract API:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error', 
      { status: 500 }
    )
  }
}

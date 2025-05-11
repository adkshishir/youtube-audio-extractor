import ytdl from 'ytdl-core'

export interface VideoFormat {
  itag: number
  quality: string
  container: string
  hasAudio: boolean
  hasVideo: boolean
  contentLength: string
  mimeType?: string
}

export interface AudioFormat {
  itag: number
  container: string
  mimeType?: string
  contentLength: string
}

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: number
  formats: VideoFormat[]
  audioFormat: AudioFormat | null
}

export async function getVideoInfo(url: string): Promise<VideoInfo | null> {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL')
    }

    console.log('Fetching video info from YouTube...')
    const info = await ytdl.getInfo(url)
    
    if (!info.videoDetails) {
      throw new Error('Could not get video details')
    }

    console.log('Video details received:', {
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      formats: info.formats.length
    })

    // Get available MP4 formats
    const formats = info.formats
      .filter(format => {
        const hasRequiredFeatures = format.hasAudio && format.hasVideo
        const isMP4 = format.container === 'mp4'
        const hasValidQuality = format.qualityLabel || format.quality
        
        return hasRequiredFeatures && isMP4 && hasValidQuality
      })
      .map(format => ({
        itag: format.itag,
        quality: format.qualityLabel || format.quality || 'unknown',
        container: 'mp4', // Force MP4 container
        hasAudio: format.hasAudio,
        hasVideo: format.hasVideo,
        contentLength: format.contentLength,
        mimeType: format.mimeType,
      }))

    console.log('Filtered MP4 formats:', formats.length)

    if (formats.length === 0) {
      console.warn('No suitable MP4 formats found, trying to get any available format')
      // Try to get any available format if no suitable ones found
      const fallbackFormats = info.formats
        .filter(format => format.hasAudio && format.hasVideo)
        .map(format => ({
          itag: format.itag,
          quality: format.qualityLabel || format.quality || 'unknown',
          container: 'mp4', // Force MP4 container
          hasAudio: format.hasAudio,
          hasVideo: format.hasVideo,
          contentLength: format.contentLength,
          mimeType: format.mimeType,
        }))

      if (fallbackFormats.length === 0) {
        throw new Error('No suitable video formats found')
      }
      
      formats.push(...fallbackFormats)
    }

    // Get audio-only format (MP3)
    let audioFormat = info.formats.find(format => 
      format.hasAudio && 
      !format.hasVideo && 
      format.container === 'mp4' // We'll convert to MP3 later
    )

    if (!audioFormat) {
      console.warn('No audio-only format found, trying to get any audio format')
      // Try to get any audio format if no suitable one found
      const fallbackAudio = info.formats.find(format => 
        format.hasAudio && !format.hasVideo
      )

      if (fallbackAudio) {
        audioFormat = fallbackAudio
      }
    }

    const videoInfo = {
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0]?.url || '',
      duration: parseInt(info.videoDetails.lengthSeconds),
      formats,
      audioFormat: audioFormat ? {
        itag: audioFormat.itag,
        container: 'mp3', // Force MP3 container
        mimeType: 'audio/mpeg',
        contentLength: audioFormat.contentLength,
      } : null,
    }

    console.log('Final video info:', {
      id: videoInfo.id,
      title: videoInfo.title,
      formats: videoInfo.formats.length,
      hasAudio: !!videoInfo.audioFormat
    })

    return videoInfo
  } catch (error) {
    console.error('Error getting video info:', error)
    throw error // Re-throw to handle in the API route
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
} 
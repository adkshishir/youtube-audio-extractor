import ytdl from 'ytdl-core'
import fs from 'fs'
import path from 'path'

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
  title: string
  thumbnail: string
  duration: number
  formats: VideoFormat[]
  audioFormat: AudioFormat | null
}

export async function getVideoInfo(url: string): Promise<VideoInfo | null> {
  try {
    const info = await ytdl.getInfo(url)
    
    // Get available formats
    const formats = info.formats
      .filter(format => 
        format.hasAudio && 
        format.hasVideo && 
        format.container === 'mp4'
      )
      .map(format => ({
        itag: format.itag,
        quality: format.qualityLabel || 'unknown',
        container: format.container,
        hasAudio: format.hasAudio,
        hasVideo: format.hasVideo,
        contentLength: format.contentLength,
        mimeType: format.mimeType,
      }))

    // Get audio-only format
    const audioFormat = info.formats.find(format => 
      format.hasAudio && 
      !format.hasVideo && 
      format.container === 'mp4'
    )

    return {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: parseInt(info.videoDetails.lengthSeconds),
      formats,
      audioFormat: audioFormat ? {
        itag: audioFormat.itag,
        container: audioFormat.container,
        mimeType: audioFormat.mimeType,
        contentLength: audioFormat.contentLength,
      } : null,
    }
  } catch (error) {
    console.error('Error getting video info:', error)
    return null
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

export function cleanupDownloads(maxAgeHours = 24) {
  const downloadsDir = path.join(process.cwd(), 'downloads')
  
  if (!fs.existsSync(downloadsDir)) {
    return
  }

  const files = fs.readdirSync(downloadsDir)
  const now = Date.now()
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000

  files.forEach(file => {
    const filePath = path.join(downloadsDir, file)
    const stats = fs.statSync(filePath)
    const fileAge = now - stats.mtimeMs

    if (fileAge > maxAgeMs) {
      fs.unlinkSync(filePath)
    }
  })
} 
'use client'

import { useState } from 'react'
import { VideoInfo } from '@/lib/youtube'
import { formatDuration } from '@/lib/youtube'

interface VideoCardProps {
  video: VideoInfo
}

export default function VideoCard({ video }: VideoCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [targetFormat, setTargetFormat] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Format options for video
  const videoFormats = [
    { label: 'Highest Quality', value: 'highestmp4' },
    { label: '1080p', value: '1080mp4' },
    { label: '720p', value: '720mp4' },
    { label: '480p', value: '480mp4' },
    { label: '360p', value: '360mp4' },
  ]

  // Format options for audio
  const audioFormats = [
    { label: 'High Quality Audio', value: 'mp3' },
  ]

  // Conversion format options
  const conversionFormats = [
    { label: 'No Conversion', value: '' },
    { label: 'MOV (QuickTime)', value: 'mov' },
    { label: 'WebM', value: 'webm' },
    { label: 'MKV', value: 'mkv' },
  ]

  const handleDownload = async () => {
    if (!selectedFormat) return

    setIsDownloading(true)
    setDownloadProgress(0)
    setError(null)

    try {
      // First download the original format
      const response = await fetch(`/api/download/${selectedFormat}/${video.id}/${video.title}.${selectedFormat === 'mp3' ? 'mp3' : 'mp4'}`)
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Download failed')
      }

      // Set up progress tracking
      const reader = response.body?.getReader()
      const contentLength = response.headers.get('Content-Length')
      const total = contentLength ? parseInt(contentLength, 10) : 0
      let received = 0

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          received += value.length
          if (total) {
            setDownloadProgress(Math.round((received / total) * 100))
          }
        }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${video.title}.${selectedFormat === 'mp3' ? 'mp3' : 'mp4'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // If a target format is selected, convert the file
      if (targetFormat && targetFormat !== selectedFormat) {
        setIsConverting(true)
        try {
          const convertResponse = await fetch('/api/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputPath: a.download,
              outputFormat: targetFormat,
            }),
          })

          if (!convertResponse.ok) {
            const errorData = await convertResponse.text()
            throw new Error(errorData || 'Conversion failed')
          }

          const { outputPath } = await convertResponse.json()
          
          // Download the converted file
          const convertedResponse = await fetch(`/api/download/${outputPath}`)
          if (!convertedResponse.ok) {
            const errorData = await convertedResponse.text()
            throw new Error(errorData || 'Failed to download converted file')
          }

          const convertedBlob = await convertedResponse.blob()
          const convertedUrl = window.URL.createObjectURL(convertedBlob)
          const convertedA = document.createElement('a')
          convertedA.href = convertedUrl
          convertedA.download = `${video.title}.${targetFormat}`
          document.body.appendChild(convertedA)
          convertedA.click()
          window.URL.revokeObjectURL(convertedUrl)
          document.body.removeChild(convertedA)
        } catch (error) {
          console.error('Conversion error:', error)
          setError(error instanceof Error ? error.message : 'Conversion failed')
        } finally {
          setIsConverting(false)
        }
      }
    } catch (error) {
      console.error('Download error:', error)
      setError(error instanceof Error ? error.message : 'Download failed')
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
          {formatDuration(video.duration)}
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{video.title}</h2>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Video Formats</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value)
                    setError(null)
                  }}
                  className="w-full p-2 border rounded text-sm"
                  disabled={isDownloading || isConverting}
                >
                  <option value="">Choose video quality...</option>
                  {videoFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Audio Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value)
                    setError(null)
                  }}
                  className="w-full p-2 border rounded text-sm"
                  disabled={isDownloading || isConverting}
                >
                  <option value="">Choose audio quality...</option>
                  {audioFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Convert To (Optional)
            </label>
            <select
              value={targetFormat}
              onChange={(e) => {
                setTargetFormat(e.target.value)
                setError(null)
              }}
              className="w-full p-2 border rounded"
              disabled={isDownloading || isConverting}
            >
              {conversionFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          {isDownloading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Downloading... {downloadProgress}%
              </p>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={!selectedFormat || isDownloading || isConverting}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isDownloading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Downloading... {downloadProgress}%
              </>
            ) : isConverting ? (
              <>
                <span className="animate-spin mr-2">🔄</span>
                Converting...
              </>
            ) : (
              <>
                <span className="mr-2">⬇️</span>
                Download {selectedFormat === 'mp3' ? 'Audio' : 'Video'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 
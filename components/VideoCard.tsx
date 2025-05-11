'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDuration } from '@/lib/youtube'

interface VideoCardProps {
  id: string
  title: string
  thumbnail: string
  duration: number
  formats: Array<{
    itag: number
    quality: string
    container: string
  }>
  audioFormat: {
    itag: number
    container: string
  } | null
}

export default function VideoCard({ id, title, thumbnail, duration, formats, audioFormat }: VideoCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!selectedFormat) return

    try {
      setLoading(true)
      const [format, container] = selectedFormat.split('-')
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${container}`
      const response = await fetch(`/api/download/${container}/${id}/${filename}`)
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {formatDuration(duration)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <div className="space-y-4">
          <Select onValueChange={setSelectedFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {audioFormat && (
                <SelectItem value={`${audioFormat.itag}-mp3`}>
                  Audio (MP3)
                </SelectItem>
              )}
              {formats.map((format) => (
                <SelectItem key={format.itag} value={`${format.itag}-${format.container}`}>
                  Video ({format.quality}) - {format.container.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleDownload}
            disabled={!selectedFormat || loading}
            className="w-full"
          >
            {loading ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect, useRef } from "react"

interface YouTubePlayerProps {
  videoId: string
  width?: string | number
  height?: string | number
  autoplay?: boolean
}

export function YouTubePlayer({ videoId, width = "100%", height = "100%", autoplay = false }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const handleLoad = () => {
      setIsLoaded(true)
    }

    if (playerRef.current) {
      playerRef.current.addEventListener("load", handleLoad)
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.removeEventListener("load", handleLoad)
      }
    }
  }, [])

  return (
    <div className="relative w-full aspect-video">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-pulse">Loading player...</div>
        </div>
      )}
      <iframe
        ref={playerRef}
        width={width}
        height={height}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      ></iframe>
    </div>
  )
}

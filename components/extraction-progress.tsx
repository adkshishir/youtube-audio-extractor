"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Music, Video, Loader2 } from "lucide-react"

interface ExtractionProgressProps {
  isExtracting: boolean
  format?: "mp3" | "mp4"
  onComplete?: () => void
}

export function ExtractionProgress({ isExtracting, format = "mp3", onComplete }: ExtractionProgressProps) {
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Initializing...")
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    if (!isExtracting) {
      setProgress(0)
      setCurrentStage(0)
      return
    }

    // Define extraction stages with realistic timing
    const audioStages = [
      { progress: 10, message: "Fetching video information...", duration: 1000 },
      { progress: 30, message: "Downloading video...", duration: 3000 },
      { progress: 60, message: "Extracting audio track...", duration: 2000 },
      { progress: 80, message: "Converting to MP3...", duration: 2000 },
      { progress: 95, message: "Finalizing...", duration: 1000 },
      { progress: 100, message: "Extraction complete! Preparing download...", duration: 500 },
    ]

    const videoStages = [
      { progress: 10, message: "Fetching video information...", duration: 1000 },
      { progress: 40, message: "Downloading video stream...", duration: 3000 },
      { progress: 70, message: "Downloading audio stream...", duration: 2000 },
      { progress: 90, message: "Merging streams...", duration: 2000 },
      { progress: 95, message: "Finalizing...", duration: 1000 },
      { progress: 100, message: "Download complete!", duration: 500 },
    ]

    const stages = format === "mp3" ? audioStages : videoStages

    const processStage = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage]
        setProgress(stage.progress)
        setStatusMessage(stage.message)

        if (currentStage < stages.length - 1) {
          setTimeout(() => {
            setCurrentStage(prev => prev + 1)
          }, stage.duration)
        } else if (onComplete) {
          setTimeout(onComplete, stage.duration)
        }
      }
    }

    processStage()

    return () => {
      setCurrentStage(stages.length) // Stop the progress
    }
  }, [isExtracting, format, currentStage, onComplete])

  if (!isExtracting) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          {format === "mp3" ? (
            <Music className="h-6 w-6 text-blue-600 animate-pulse" />
          ) : (
            <Video className="h-6 w-6 text-purple-600 animate-pulse" />
          )}
          <Loader2 className="h-4 w-4 absolute -top-1 -right-1 animate-spin text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{statusMessage}</p>
          <Progress value={progress} className="h-2 mt-2" />
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Starting...</span>
        <span>{progress}%</span>
        <span>Complete</span>
      </div>
    </div>
  )
}

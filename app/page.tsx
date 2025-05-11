"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Search, Download, Loader2, Music, Video, Youtube, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { extractVideoId, searchVideos, getVideoDetails } from "@/lib/youtube-utils"
import { ExtractionProgress } from "@/components/extraction-progress"
import { extractMedia } from "./actions/extract-media"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

// Add type for extraction result
type ExtractionResult = {
  id: string
  videoId: string
  title: string
  format: "mp3" | "mp4"
  fileName: string
  filePath: string
  size: number
  createdAt: Date
  downloadPath: string
}

const COOKIES_PATH = "/home/youruser/cookies.txt";

const YT_DLP_OPTIONS = [
  "--no-check-certificates",
  "--no-cache-dir",
  "--extractor-retries 3",
  "--force-ipv4",
  "--geo-bypass",
  "--ignore-errors",
  "--no-warnings",
  "--user-agent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'",
  `--cookies ${COOKIES_PATH}`
].join(" ");

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionFormat, setExtractionFormat] = useState<"mp3" | "mp4">("mp3")
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState("")
  const [extractionComplete, setExtractionComplete] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSearching(true)

    try {
      const results = await searchVideos(searchQuery)
      setSearchResults(results)
    } catch (err: any) {
      setError(err.message || "Failed to search videos. Please try again.")
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleVideoUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setExtractionResult(null)
    setExtractionComplete(false)

    try {
      const videoId = extractVideoId(videoUrl)
      if (!videoId) {
        setError("Invalid YouTube URL. Please enter a valid YouTube video URL.")
        return
      }

      setIsSearching(true)
      const videoDetails = await getVideoDetails(videoId)
      setSelectedVideo(videoDetails)
      setSearchResults([])
    } catch (err: any) {
      setError(err.message || "Failed to get video details. Please check the URL and try again.")
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectVideo = async (video: any) => {
    setSelectedVideo(video)
    setSearchResults([])
    setExtractionResult(null)
    setExtractionComplete(false)
  }

  const handleExtractMedia = async () => {
    if (!selectedVideo) return

    setIsExtracting(true)
    setError("")
    setExtractionResult(null)
    setExtractionComplete(false)

    try {
      // Call the server action to extract media
      const result = await extractMedia(selectedVideo.id, extractionFormat)
      setExtractionResult(result)

      // Simulate extraction process with a delay
      setTimeout(() => {
        setExtractionComplete(true)
        setIsExtracting(false)
      }, 5000)
    } catch (err: any) {
      setError(err.message || `Failed to extract ${extractionFormat}. Please try again.`)
      console.error(err)
      setIsExtracting(false)
    }
  }

  const handleFormatChange = (value: string) => {
    setExtractionFormat(value as "mp3" | "mp4")
    // Reset extraction state when changing format
    setExtractionResult(null)
    setExtractionComplete(false)
  }

  const handleDownload = async () => {
    if (!extractionResult) {
      setError('No extraction result available')
      return
    }

    try {
      // Create a link element
      const link = document.createElement('a')
      link.href = extractionResult.downloadPath
      link.download = extractionResult.fileName
      document.body.appendChild(link)
      
      // Trigger the download
      link.click()
      
      // Clean up
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download the file. Please try again.')
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          YouTube Media Extractor
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Download YouTube videos and extract audio in high quality. Fast, free, and easy to use.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              Search Videos
            </CardTitle>
            <CardDescription>Search for videos or enter a YouTube URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search for videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching} className="bg-blue-600 hover:bg-blue-700">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <form onSubmit={handleVideoUrlSubmit} className="flex gap-2">
              <Input
                placeholder="Enter YouTube URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching} className="bg-green-600 hover:bg-green-700">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {searchResults.length > 0 && (
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                  {searchResults.map((video) => (
                    <div
                      key={video.id}
                      className="flex gap-4 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectVideo(video)}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{video.title}</h3>
                        <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Selected Video</CardTitle>
            <CardDescription>Video details and media extraction</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
                  <img
                    src={selectedVideo.thumbnail || "/placeholder.svg?height=720&width=1280"}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Badge variant="secondary" className="text-sm">
                      Click to extract
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{selectedVideo.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedVideo.channelTitle}</p>
                </div>

                <div>
                  <label>Select Format</label>
                  <select
                    value={extractionFormat}
                    onChange={e => handleFormatChange(e.target.value)}
                    disabled={isExtracting}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Choose a format...</option>
                    <option value="mp3">Audio (MP3)</option>
                    <option value="mp4">Video (MP4)</option>
                    <option value="mov">Video (MOV)</option>
                    <option value="webm">Video (WebM)</option>
                    <option value="mkv">Video (MKV)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Youtube className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No video selected. Search for a video or enter a YouTube URL.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {selectedVideo && (
              <div className="w-full space-y-4">
                {!extractionComplete ? (
                  <>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                      onClick={handleExtractMedia} 
                      disabled={isExtracting}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {extractionFormat === "mp3" ? "Extracting Audio..." : "Extracting Video..."}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          {extractionFormat === "mp3" ? "Extract Audio" : "Extract Video"}
                        </>
                      )}
                    </Button>
                    {isExtracting && <ExtractionProgress isExtracting={isExtracting} format={extractionFormat} />}
                  </>
                ) : (
                  <Button 
                    onClick={handleDownload} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {extractionFormat === "mp3" ? (
                      <>
                        <Music className="h-4 w-4 mr-2" /> Download MP3 Audio
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" /> Download MP4 Video
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} YouTube Media Extractor. All rights reserved.</p>
        <p className="mt-2">
          This tool is for personal use only. Please respect YouTube's terms of service and copyright laws.
        </p>
      </footer>
    </main>
  )
}

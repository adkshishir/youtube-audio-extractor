import { NextResponse } from "next/server"

// This simulates an in-memory cache of extracted audio files
// In a real app, you would use a database or file storage
const extractedAudioCache = new Map()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const videoId = params.id

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
  }

  try {
    // Get video details to use for the filename
    const API_KEY = process.env.YOUTUBE_API_KEY
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`,
    )

    if (!videoDetailsResponse.ok) {
      throw new Error(`YouTube API responded with ${videoDetailsResponse.status}`)
    }

    const videoData = await videoDetailsResponse.json()

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const videoTitle = videoData.items[0].snippet.title
    const safeFileName = videoTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()

    // Store the extraction information in our cache
    // In a real app, this would be the result of actual extraction
    extractedAudioCache.set(videoId, {
      id: videoId,
      title: videoTitle,
      fileName: `${safeFileName}.mp3`,
      extractedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      message: "Audio extraction completed",
      videoId,
      videoTitle,
      audioUrl: `/api/download/${videoId}/${safeFileName}.mp3`,
      format: "mp3",
      status: "success",
    })
  } catch (error) {
    console.error("Error extracting audio:", error)
    return NextResponse.json({ error: "Failed to extract audio from video" }, { status: 500 })
  }
}

// Export the cache so it can be accessed by the download route
export { extractedAudioCache }

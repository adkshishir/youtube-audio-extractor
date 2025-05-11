import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const videoId = params.id

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
  }

  try {
    // In a real implementation, you would use the YouTube Data API
    const API_KEY = process.env.YOUTUBE_API_KEY

    if (!API_KEY) {
      return NextResponse.json({ error: "YouTube API key is not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`YouTube API responded with ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const videoDetails = data.items[0]

    return NextResponse.json({
      id: videoId,
      title: videoDetails.snippet.title,
      channelTitle: videoDetails.snippet.channelTitle,
      thumbnail: videoDetails.snippet.thumbnails.high.url,
      description: videoDetails.snippet.description,
      duration: videoDetails.contentDetails.duration,
    })
  } catch (error) {
    console.error("Error fetching video details:", error)
    return NextResponse.json({ error: "Failed to fetch video details" }, { status: 500 })
  }
}

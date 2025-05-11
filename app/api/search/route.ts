import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // In a real implementation, you would use the YouTube Data API
    // This requires an API key from Google Cloud Console
    const API_KEY = process.env.YOUTUBE_API_KEY

    if (!API_KEY) {
      return NextResponse.json({ error: "YouTube API key is not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=9&key=${API_KEY}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`YouTube API responded with ${response.status}`)
    }

    const data = await response.json()

    // Transform the response to a simpler format
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      description: item.snippet.description,
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error searching YouTube:", error)
    return NextResponse.json({ error: "Failed to search YouTube videos" }, { status: 500 })
  }
}

// This is a client-side utility file for YouTube operations

/**
 * Extract YouTube video ID from URL
 */
export function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

/**
 * Search for YouTube videos
 */
export async function searchVideos(query: string): Promise<any[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to search videos")
  }

  const data = await response.json()
  return data.videos || []
}

/**
 * Get video details by ID
 */
export async function getVideoDetails(videoId: string): Promise<any> {
  const response = await fetch(`/api/video/${videoId}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to get video details")
  }

  return response.json()
}

"use server"

import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { promisify } from "util"

const execAsync = promisify(exec)

// Store extraction results for retrieval
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

// In-memory storage (would use a database in production)
const extractionResults = new Map<string, ExtractionResult>()

// Common yt-dlp options to bypass restrictions
const YT_DLP_OPTIONS = [
  "--no-check-certificates",
  "--no-cache-dir",
  "--extractor-retries 3",
  "--force-ipv4",
  "--geo-bypass",
  "--ignore-errors",
  "--no-warnings",
  "--user-agent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'",
].join(" ")

// Get video info using yt-dlp
async function getVideoInfo(videoId: string): Promise<{ title: string }> {
  try {
    const { stdout } = await execAsync(
      `yt-dlp ${YT_DLP_OPTIONS} --get-title 'https://www.youtube.com/watch?v=${videoId}'`,
    )
    return {
      title: stdout.trim(),
    }
  } catch (error) {
    console.error("Error getting video info:", error)
    throw new Error("Failed to get video information")
  }
}

// Extract media from YouTube video
export async function extractMedia(videoId: string, format: "mp3" | "mp4"): Promise<ExtractionResult> {
  try {
    // Get video info
    const videoInfo = await getVideoInfo(videoId)
    const title = videoInfo.title
    const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase()

    // Generate unique ID for this extraction
    const extractionId = uuidv4()
    // Ensure proper file extension
    const extension = format === "mp3" ? ".mp3" : ".mp4"
    const outputFileName = `${safeTitle}_${extractionId}${extension}`
    const outputPath = path.join(process.cwd(), "downloads", outputFileName)

    // Create downloads directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), "downloads"), { recursive: true })

    try {
      // Download and extract using yt-dlp
      if (format === "mp3") {
        // Extract audio in MP3 format
        const { stdout, stderr } = await execAsync(
          `yt-dlp ${YT_DLP_OPTIONS} --extract-audio --audio-format mp3 --audio-quality 0 -o '${outputPath}' 'https://www.youtube.com/watch?v=${videoId}'`,
        )
        console.log("Audio extraction output:", stdout)
        if (stderr) console.error("Audio extraction stderr:", stderr)
      } else {
        // Download video in MP4 format with best quality
        const { stdout, stderr } = await execAsync(
          `yt-dlp ${YT_DLP_OPTIONS} -f 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4] / bv*+ba/b' --merge-output-format mp4 -o '${outputPath}' 'https://www.youtube.com/watch?v=${videoId}'`,
        )
        console.log("Video extraction output:", stdout)
        if (stderr) console.error("Video extraction stderr:", stderr)
      }

      // Verify the file exists and has content
      const fileExists = await fs.access(outputPath).then(() => true).catch(() => false)
      if (!fileExists) {
        throw new Error(`Output file was not created at ${outputPath}`)
      }

      // Get file size
      const stats = await fs.stat(outputPath)
      if (stats.size === 0) {
        throw new Error("Output file was created but is empty")
      }

      // Create extraction result
      const result: ExtractionResult = {
        id: extractionId,
        videoId,
        title,
        format,
        fileName: outputFileName,
        filePath: outputPath,
        size: stats.size,
        createdAt: new Date(),
        downloadPath: `/downloads/${outputFileName}`,
      }

      // Store the result
      extractionResults.set(extractionId, result)

      return result
    } catch (execError: any) {
      console.error("Error during media extraction:", {
        error: execError,
        message: execError.message,
        stdout: execError.stdout,
        stderr: execError.stderr,
      })
      throw new Error(`Failed to extract ${format}: ${execError.message}`)
    }
  } catch (error: any) {
    console.error("Error in extractMedia:", error)
    throw new Error(`Failed to extract ${format} from video: ${error.message}`)
  }
}

// Get extraction result by ID
export async function getExtractionResult(id: string): Promise<ExtractionResult | null> {
  return extractionResults.get(id) || null
}

// Delete extraction result by ID
export async function deleteExtractionResult(id: string): Promise<boolean> {
  const result = extractionResults.get(id)
  if (result) {
    try {
      await fs.unlink(result.filePath)
      extractionResults.delete(id)
      return true
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }
  return false
}

# Deployment Guide for YouTube Media Extractor

This guide explains how to deploy the YouTube Media Extractor in a production environment with full functionality.

## Server Requirements

To run this application with full functionality, you need:

1. A server with Node.js installed
2. youtube-dl installed on the server
3. ffmpeg installed on the server
4. Sufficient storage space for downloaded videos

## Installation Steps

### 1. Set Up a Server

You can use a VPS provider like DigitalOcean, AWS EC2, or Linode. For this application, we recommend:
- At least 2GB RAM
- 2 CPU cores
- 50GB+ storage

### 2. Install Dependencies

\`\`\`bash
# Update package lists
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Install youtube-dl
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/youtube-dl
sudo chmod a+rx /usr/local/bin/youtube-dl

# Install ffmpeg
sudo apt install ffmpeg
\`\`\`

### 3. Configure the Application

1. Clone the repository
2. Install npm dependencies
3. Create a `.env` file with your YouTube API key
4. Create a downloads directory with proper permissions

\`\`\`bash
mkdir -p downloads
chmod 755 downloads
\`\`\`

### 4. Modify the Code for Production

#### Update the extract-media.ts file:

\`\`\`typescript
"use server"

import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Promisify exec
function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`)
        console.error(`stderr: ${stderr}`)
        reject(error)
        return
      }
      resolve(stdout)
    })
  })
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
    const outputFileName = `${safeTitle}_${extractionId}.${format}`
    const outputPath = path.join(process.cwd(), "downloads", outputFileName)

    // Create downloads directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), "downloads"), { recursive: true })

    // Download and extract using youtube-dl
    if (format === "mp3") {
      // Extract audio in MP3 format
      await execCommand(
        `youtube-dl -x --audio-format mp3 -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`
      )
    } else {
      // Download video in MP4 format
      await execCommand(
        `youtube-dl -f "best[ext=mp4]" -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`
      )
    }

    // Get file size
    const stats = await fs.stat(outputPath)

    // Create extraction result
    const result: ExtractionResult = {
      id: extractionId,
      videoId,
      title,
      format,
      filePath: outputPath,
      fileName: outputFileName,
      size: stats.size,
      createdAt: new Date(),
      url: `/api/download/${format}/${extractionId}/${encodeURIComponent(outputFileName)}`,
    }

    // Store the result
    extractionResults.set(extractionId, result)

    return result
  } catch (error) {
    console.error("Error extracting media:", error)
    throw new Error(`Failed to extract ${format} from video`)
  }
}
\`\`\`

#### Update the download API routes to serve actual files:

\`\`\`typescript
import { NextResponse } from "next/server"
import fs from "fs"
import { extractionResults } from "@/app/actions/extract-media"

export async function GET(
  request: Request,
  { params }: { params: { id: string; filename: string } }
) {
  const { id, filename } = params

  try {
    // Get extraction result
    const extractionResult = extractionResults.get(id)

    if (!extractionResult) {
      return NextResponse.json(
        { error: "File not found. It may have expired or been deleted." },
        { status: 404 }
      )
    }

    // Check if file exists
    if (!fs.existsSync(extractionResult.filePath)) {
      return NextResponse.json(
        { error: "File not found on server. It may have been deleted." },
        { status: 404 }
      )
    }

    // Create a readable stream from the file
    const fileStream = fs.createReadStream(extractionResult.filePath)

    // Determine content type
    const contentType = extractionResult.format === "mp3" ? "audio/mpeg" : "video/mp4"

    // Return file with proper headers
    return new NextResponse(fileStream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
        "Content-Length": extractionResult.size.toString(),
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
  }
}
\`\`\`

### 5. Implement File Cleanup

To prevent storage issues, add a scheduled task to clean up old files:

\`\`\`typescript
// cleanup.ts
import fs from "fs"
import path from "path"
import { extractionResults } from "./app/actions/extract-media"

// Delete files older than 24 hours
function cleanupOldFiles() {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  extractionResults.forEach((result, id) => {
    if (result.createdAt < oneDayAgo) {
      // Delete the file
      try {
        fs.unlinkSync(result.filePath)
        // Remove from the map
        extractionResults.delete(id)
        console.log(`Deleted old file: ${result.fileName}`)
      } catch (error) {
        console.error(`Error deleting file ${result.fileName}:`, error)
      }
    }
  })
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000)
\`\`\`

### 6. Deploy with PM2

Use PM2 to keep your application running:

\`\`\`bash
# Install PM2
npm install -g pm2

# Build the Next.js app
npm run build

# Start with PM2
pm2 start npm --name "youtube-extractor" -- start

# Set up PM2 to start on boot
pm2 startup
pm2 save
\`\`\`

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Authentication**: Add user authentication to control access
3. **HTTPS**: Ensure your server uses HTTPS for secure connections
4. **API Key Security**: Keep your YouTube API key secure
5. **File Validation**: Validate all user inputs and file operations

## Scaling Considerations

For high-traffic scenarios:
1. Use a dedicated file storage service like AWS S3
2. Implement a queue system for extraction jobs
3. Consider using multiple worker servers for parallel processing
4. Add caching for frequently requested videos

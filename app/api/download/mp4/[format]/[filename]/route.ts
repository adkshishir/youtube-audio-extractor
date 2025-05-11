import { NextResponse } from "next/server"
import { getExtractionResult } from "@/app/actions/extract-media"
import { promises as fs } from 'fs'

export async function GET(request: Request, { params }: { params: { format: string; filename: string } }) {
  const { format, filename } = params

  try {
    // Get extraction result
    const extractionResult = await getExtractionResult(format)

    if (!extractionResult || extractionResult.format !== "mp4") {
      return NextResponse.json({ error: "Video file not found. It may have expired or been deleted." }, { status: 404 })
    }

    try {
      // Read the actual file from the downloads directory
      const fileBuffer = await fs.readFile(extractionResult.filePath)

      // Return file with proper headers
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Disposition": `attachment; filename="${extractionResult.fileName}"`,
          "Content-Type": "video/mp4",
          "Content-Length": fileBuffer.length.toString(),
        },
      })
    } catch (error) {
      console.error("Error reading file:", error)
      return NextResponse.json({ error: "File not found in downloads directory" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error serving video file:", error)
    return NextResponse.json({ error: "Failed to serve video file" }, { status: 500 })
  }
}

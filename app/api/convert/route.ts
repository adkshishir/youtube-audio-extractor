import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { inputPath, outputFormat } = await request.json()

    if (!inputPath || !outputFormat) {
      return new NextResponse('Input path and output format are required', { status: 400 })
    }

    const inputDir = path.dirname(inputPath)
    const inputFileName = path.basename(inputPath, path.extname(inputPath))
    const outputPath = path.join(inputDir, `${inputFileName}.${outputFormat}`)

    // Convert the file using ffmpeg
    const command = `ffmpeg -i "${inputPath}" -c:v copy -c:a copy "${outputPath}"`
    
    try {
      await execAsync(command)
      
      // Check if the output file exists
      if (!fs.existsSync(outputPath)) {
        throw new Error('Conversion failed: Output file not created')
      }

      return NextResponse.json({ 
        success: true, 
        outputPath,
        message: 'File converted successfully'
      })
    } catch (error) {
      console.error('FFmpeg conversion error:', error)
      return new NextResponse(
        error instanceof Error ? error.message : 'Failed to convert file',
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in convert API:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    )
  }
} 